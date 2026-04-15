param(
  [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not $OutputPath) {
  $OutputPath = Join-Path $PSScriptRoot '..\public\og-image.png'
}

$OutputPath = [System.IO.Path]::GetFullPath($OutputPath)

Add-Type -AssemblyName System.Drawing

function New-HexColor {
  param(
    [Parameter(Mandatory = $true)][string]$Hex,
    [int]$Alpha = 255
  )

  $clean = $Hex.TrimStart('#')
  if ($clean.Length -ne 6) {
    throw "Expected a 6-digit hex color, got '$Hex'."
  }

  $r = [Convert]::ToInt32($clean.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($clean.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($clean.Substring(4, 2), 16)

  return [System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b)
}

function Get-FontName {
  param([string[]]$Candidates)

  $installed = [System.Drawing.Text.InstalledFontCollection]::new().Families.Name
  foreach ($candidate in $Candidates) {
    if ($installed -contains $candidate) {
      return $candidate
    }
  }

  return [System.Drawing.FontFamily]::GenericSansSerif.Name
}

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()

  if ($Radius -le 0) {
    $path.AddRectangle([System.Drawing.RectangleF]::new($X, $Y, $Width, $Height))
    return $path
  }

  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function Add-Glow {
  param(
    $Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [float]$Radius,
    [string]$Hex,
    [int]$MaxAlpha,
    [float]$ScaleY = 1.0,
    [int]$Steps = 14
  )

  for ($step = $Steps; $step -ge 1; $step--) {
    $ratio = $step / $Steps
    $alpha = [Math]::Max(1, [int]($MaxAlpha * $ratio * $ratio))
    $width = $Radius * 2 * $ratio
    $height = $width * $ScaleY
    $brush = [System.Drawing.SolidBrush]::new((New-HexColor $Hex $alpha))
    $Graphics.FillEllipse(
      $brush,
      [float]($CenterX - ($width / 2)),
      [float]($CenterY - ($height / 2)),
      [float]$width,
      [float]$height
    )
    $brush.Dispose()
  }
}

function Draw-SpacedText {
  param(
    $Graphics,
    [string]$Text,
    $Font,
    $Brush,
    [float]$X,
    [float]$Y,
    [float]$Tracking = 0
  )

  $cursor = $X
  $format = [System.Drawing.StringFormat]::new()
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::MeasureTrailingSpaces

  foreach ($character in $Text.ToCharArray()) {
    $glyph = [string]$character
    $Graphics.DrawString($glyph, $Font, $Brush, [float]$cursor, [float]$Y, $format)
    $size = $Graphics.MeasureString($glyph, $Font, 1000, $format)
    $cursor += $size.Width + $Tracking
  }

  $format.Dispose()
  return $cursor
}

function Get-SpacedTextWidth {
  param(
    $Graphics,
    [string]$Text,
    $Font,
    [float]$Tracking = 0
  )

  $width = 0.0
  $format = [System.Drawing.StringFormat]::new()
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::MeasureTrailingSpaces

  foreach ($character in $Text.ToCharArray()) {
    $glyph = [string]$character
    $size = $Graphics.MeasureString($glyph, $Font, 1000, $format)
    $width += $size.Width + $Tracking
  }

  if ($Text.Length -gt 0) {
    $width -= $Tracking
  }

  $format.Dispose()
  return $width
}

function Draw-Chip {
  param(
    $Graphics,
    [string]$Text,
    [float]$X,
    [float]$Y,
    $Font,
    [string]$FillHex,
    [int]$FillAlpha,
    [string]$BorderHex,
    [int]$BorderAlpha,
    [string]$TextHex
  )

  $measureFormat = [System.Drawing.StringFormat]::new()
  $size = $Graphics.MeasureString($Text, $Font, 1000, $measureFormat)
  $measureFormat.Dispose()

  $width = [float][Math]::Ceiling($size.Width + 28)
  $height = 38.0

  $path = New-RoundedRectPath -X $X -Y $Y -Width $width -Height $height -Radius 11
  $fillBrush = [System.Drawing.SolidBrush]::new((New-HexColor $FillHex $FillAlpha))
  $borderPen = [System.Drawing.Pen]::new((New-HexColor $BorderHex $BorderAlpha), 1.2)
  $textBrush = [System.Drawing.SolidBrush]::new((New-HexColor $TextHex))

  $Graphics.FillPath($fillBrush, $path)
  $Graphics.DrawPath($borderPen, $path)
  $Graphics.DrawString($Text, $Font, $textBrush, [System.Drawing.RectangleF]::new($X + 14, $Y + 9, $width - 18, $height - 12))

  $textBrush.Dispose()
  $borderPen.Dispose()
  $fillBrush.Dispose()
  $path.Dispose()

  return $width
}

function Draw-FaviconMark {
  param(
    $Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [float]$Scale = 1.0
  )

  $outerRadius = 50.0 * $Scale
  $circlePath = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $circlePath.AddEllipse(
    [float]($CenterX - $outerRadius),
    [float]($CenterY - $outerRadius),
    [float]($outerRadius * 2),
    [float]($outerRadius * 2)
  )

  $bgBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($circlePath)
  $bgBrush.CenterPoint = [System.Drawing.PointF]::new($CenterX, $CenterY)
  $bgBrush.CenterColor = New-HexColor '#0d0e1e'
  $bgBrush.SurroundColors = [System.Drawing.Color[]]@((New-HexColor '#07080f'))
  $Graphics.FillPath($bgBrush, $circlePath)

  $rayBase = [System.Drawing.Pen]::new((New-HexColor '#5a52e0' 205), [float](1.6 * $Scale))
  $rayGlow = [System.Drawing.Pen]::new((New-HexColor '#9b93ff' 175), [float](0.9 * $Scale))
  $dotBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#8b7fff'))
  $ringPen = [System.Drawing.Pen]::new((New-HexColor '#6c63ff' 105), [float](0.7 * $Scale))
  $coreOuterBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#07080f'))
  $coreInnerBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#04050b'))

  $innerRayRadius = 18.0 * $Scale
  $outerRayRadius = 30.0 * $Scale
  $dotRadius = 1.4 * $Scale

  for ($i = 0; $i -lt 24; $i++) {
    $rad = (($i * 15.0) - 90.0) * [Math]::PI / 180.0
    $x1 = $CenterX + ($innerRayRadius * [Math]::Cos($rad))
    $y1 = $CenterY + ($innerRayRadius * [Math]::Sin($rad))
    $x2 = $CenterX + ($outerRayRadius * [Math]::Cos($rad))
    $y2 = $CenterY + ($outerRayRadius * [Math]::Sin($rad))
    $dotX = $CenterX + (31.0 * $Scale * [Math]::Cos($rad))
    $dotY = $CenterY + (31.0 * $Scale * [Math]::Sin($rad))

    $Graphics.DrawLine($rayBase, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
    $Graphics.DrawLine($rayGlow, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
    $Graphics.FillEllipse($dotBrush, [float]($dotX - $dotRadius), [float]($dotY - $dotRadius), [float]($dotRadius * 2), [float]($dotRadius * 2))
  }

  $Graphics.FillEllipse($coreOuterBrush, [float]($CenterX - (15.0 * $Scale)), [float]($CenterY - (15.0 * $Scale)), [float](30.0 * $Scale), [float](30.0 * $Scale))
  $Graphics.FillEllipse($coreInnerBrush, [float]($CenterX - (13.0 * $Scale)), [float]($CenterY - (13.0 * $Scale)), [float](26.0 * $Scale), [float](26.0 * $Scale))
  $Graphics.DrawEllipse($ringPen, [float]($CenterX - (15.0 * $Scale)), [float]($CenterY - (15.0 * $Scale)), [float](30.0 * $Scale), [float](30.0 * $Scale))

  $coreInnerBrush.Dispose()
  $coreOuterBrush.Dispose()
  $ringPen.Dispose()
  $dotBrush.Dispose()
  $rayGlow.Dispose()
  $rayBase.Dispose()
  $bgBrush.Dispose()
  $circlePath.Dispose()
}

function Draw-LiveSignalCard {
  param(
    $Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [string]$Chain,
    [string]$Headline,
    [string]$Value,
    [string]$Time,
    [string]$ChainHex,
    $ChainFont,
    $BadgeFont,
    $BodyFont,
    $MetaFont
  )

  $height = 96.0
  $cardPath = New-RoundedRectPath -X $X -Y $Y -Width $Width -Height $height -Radius 14
  $cardFill = [System.Drawing.SolidBrush]::new((New-HexColor '#060912'))
  $cardBorder = [System.Drawing.Pen]::new((New-HexColor '#1e2d45'), 1.0)
  $chainBrush = [System.Drawing.SolidBrush]::new((New-HexColor $ChainHex))
  $headlineBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#e8eaf0'))
  $valueBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#6c63ff'))
  $timeBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#5a6478'))
  $badgeFill = [System.Drawing.SolidBrush]::new((New-HexColor '#00e5a0' 26))
  $badgeBorder = [System.Drawing.Pen]::new((New-HexColor '#00e5a0' 84), 1.0)
  $badgeText = [System.Drawing.SolidBrush]::new((New-HexColor '#00e5a0'))
  $rightFormat = [System.Drawing.StringFormat]::new()
  $rightFormat.Alignment = [System.Drawing.StringAlignment]::Far

  $Graphics.FillPath($cardFill, $cardPath)
  $Graphics.DrawPath($cardBorder, $cardPath)
  $Graphics.DrawString($Chain, $ChainFont, $chainBrush, [System.Drawing.RectangleF]::new($X + 18, $Y + 14, 42, 18))

  $badgePath = New-RoundedRectPath -X ($X + 72) -Y ($Y + 12) -Width 48 -Height 22 -Radius 8
  $Graphics.FillPath($badgeFill, $badgePath)
  $Graphics.DrawPath($badgeBorder, $badgePath)
  $Graphics.DrawString('HIGH', $BadgeFont, $badgeText, [System.Drawing.RectangleF]::new($X + 83, $Y + 16, 30, 12))

  $Graphics.DrawString($Time, $MetaFont, $timeBrush, [System.Drawing.RectangleF]::new($X + $Width - 86, $Y + 15, 58, 16), $rightFormat)
  $Graphics.DrawString($Headline, $BodyFont, $headlineBrush, [System.Drawing.RectangleF]::new($X + 18, $Y + 42, $Width - 36, 32))
  $Graphics.DrawString($Value, $MetaFont, $valueBrush, [System.Drawing.RectangleF]::new($X + 18, $Y + 72, $Width - 36, 16))

  $rightFormat.Dispose()
  $badgeText.Dispose()
  $badgeBorder.Dispose()
  $badgeFill.Dispose()
  $badgePath.Dispose()
  $timeBrush.Dispose()
  $valueBrush.Dispose()
  $headlineBrush.Dispose()
  $chainBrush.Dispose()
  $cardBorder.Dispose()
  $cardFill.Dispose()
  $cardPath.Dispose()
}

function Draw-SignalRow {
  param(
    $Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [string]$Badge,
    [string]$Headline,
    [string]$Value,
    [string]$AccentHex,
    $BadgeFont,
    $HeadlineFont,
    $ValueFont
  )

  $rowPath = New-RoundedRectPath -X $X -Y $Y -Width $Width -Height 64 -Radius 16
  $rowFill = [System.Drawing.SolidBrush]::new((New-HexColor '#0a1322' 225))
  $rowBorder = [System.Drawing.Pen]::new((New-HexColor '#243654' 230), 1.1)
  $Graphics.FillPath($rowFill, $rowPath)
  $Graphics.DrawPath($rowBorder, $rowPath)

  $badgeWidth = if ($Badge.Length -ge 6) { 88.0 } else { 66.0 }
  $badgePath = New-RoundedRectPath -X ($X + 14) -Y ($Y + 18) -Width $badgeWidth -Height 28 -Radius 10
  $badgeFill = [System.Drawing.SolidBrush]::new((New-HexColor $AccentHex 36))
  $badgeBorder = [System.Drawing.Pen]::new((New-HexColor $AccentHex 180), 1.0)
  $badgeText = [System.Drawing.SolidBrush]::new((New-HexColor $AccentHex))
  $headlineBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#eef2ff'))
  $valueBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#9fb4d0'))
  $valueFormat = [System.Drawing.StringFormat]::new()
  $valueFormat.Alignment = [System.Drawing.StringAlignment]::Far

  $Graphics.FillPath($badgeFill, $badgePath)
  $Graphics.DrawPath($badgeBorder, $badgePath)
  $Graphics.DrawString($Badge, $BadgeFont, $badgeText, [System.Drawing.RectangleF]::new($X + 26, $Y + 23, $badgeWidth - 12, 18))
  $Graphics.DrawString($Headline, $HeadlineFont, $headlineBrush, [System.Drawing.RectangleF]::new($X + $badgeWidth + 28, $Y + 17, $Width - $badgeWidth - 152, 30))
  $Graphics.DrawString($Value, $ValueFont, $valueBrush, [System.Drawing.RectangleF]::new($X + $Width - 138, $Y + 20, 112, 24), $valueFormat)

  $valueFormat.Dispose()
  $valueBrush.Dispose()
  $headlineBrush.Dispose()
  $badgeText.Dispose()
  $badgeBorder.Dispose()
  $badgeFill.Dispose()
  $badgePath.Dispose()
  $rowBorder.Dispose()
  $rowFill.Dispose()
  $rowPath.Dispose()
}

$width = 1200
$height = 630

$bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bitmap.SetResolution(144, 144)

$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$backgroundBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#060912'))
$graphics.FillRectangle($backgroundBrush, 0, 0, $width, $height)
$backgroundBrush.Dispose()

Add-Glow -Graphics $graphics -CenterX 330 -CenterY 192 -Radius 200 -Hex '#6c63ff' -MaxAlpha 32 -ScaleY 0.72
Add-Glow -Graphics $graphics -CenterX 332 -CenterY 205 -Radius 152 -Hex '#6c63ff' -MaxAlpha 22 -ScaleY 0.72

$grainPen = [System.Drawing.Pen]::new((New-HexColor '#ffffff' 6), 1)
for ($grainY = 96; $grainY -le $height; $grainY += 72) {
  $graphics.DrawLine($grainPen, 48, $grainY, 690, $grainY)
}
$grainPen.Dispose()

$headerBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#060912' 240))
$headerBorder = [System.Drawing.Pen]::new((New-HexColor '#1e2d45'), 1)
$graphics.FillRectangle($headerBrush, 0, 0, $width, 76)
$graphics.DrawLine($headerBorder, 0, 75, $width, 75)
$headerBrush.Dispose()
$headerBorder.Dispose()

$monoName = Get-FontName @('Courier New', 'Consolas', 'Cascadia Mono')
$uiName = Get-FontName @('Inter', 'Segoe UI', 'Arial')

$headerLogoFont = [System.Drawing.Font]::new($monoName, 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$headerMetaFont = [System.Drawing.Font]::new($uiName, 11, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$heroTitleFont = [System.Drawing.Font]::new($monoName, 74, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$heroSubFont = [System.Drawing.Font]::new($uiName, 13, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$heroBodyFont = [System.Drawing.Font]::new($uiName, 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$heroHintFont = [System.Drawing.Font]::new($uiName, 12, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$chipFont = [System.Drawing.Font]::new($uiName, 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$panelLabelFont = [System.Drawing.Font]::new($uiName, 10, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$chainFont = [System.Drawing.Font]::new($monoName, 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$cardBodyFont = [System.Drawing.Font]::new($uiName, 13, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$cardMetaFont = [System.Drawing.Font]::new($monoName, 11, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$badgeFont = [System.Drawing.Font]::new($uiName, 9, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$whiteBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#e8eaf0'))
$mutedBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#8892a4'))
$dimBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#5a6478'))

[void](Draw-SpacedText -Graphics $graphics -Text 'NYTHOS' -Font $headerLogoFont -Brush $whiteBrush -X 56 -Y 24 -Tracking 4.5)
[void](Draw-Chip -Graphics $graphics -Text '$NYT' -X 246 -Y 20 -Font $chipFont -FillHex '#6c63ff' -FillAlpha 30 -BorderHex '#6c63ff' -BorderAlpha 102 -TextHex '#6c63ff')
[void](Draw-SpacedText -Graphics $graphics -Text 'JOIN FOUNDER LIST' -Font $headerMetaFont -Brush $mutedBrush -X 806 -Y 29 -Tracking 1.1)
[void](Draw-Chip -Graphics $graphics -Text 'CONNECT WALLET' -X 1010 -Y 18 -Font $chipFont -FillHex '#6c63ff' -FillAlpha 255 -BorderHex '#6c63ff' -BorderAlpha 255 -TextHex '#ffffff')

Draw-FaviconMark -Graphics $graphics -CenterX 338 -CenterY 178 -Scale 1.58

$titleWidth = Get-SpacedTextWidth -Graphics $graphics -Text 'NYTHOS' -Font $heroTitleFont -Tracking 8.5
$titleX = 56 + ((610 - $titleWidth) / 2)
[void](Draw-SpacedText -Graphics $graphics -Text 'NYTHOS' -Font $heroTitleFont -Brush $whiteBrush -X $titleX -Y 248 -Tracking 8.5)

$centerFormat = [System.Drawing.StringFormat]::new()
$centerFormat.Alignment = [System.Drawing.StringAlignment]::Center

$subLineOne = 'BASE-NATIVE ONCHAIN INTELLIGENCE'
$subLineTwo = 'WORKING PRODUCT IN BETA'
$subLineOneWidth = Get-SpacedTextWidth -Graphics $graphics -Text $subLineOne -Font $heroSubFont -Tracking 1.8
$subLineTwoWidth = Get-SpacedTextWidth -Graphics $graphics -Text $subLineTwo -Font $heroSubFont -Tracking 1.8
$subLineOneX = 56 + ((610 - $subLineOneWidth) / 2)
$subLineTwoX = 56 + ((610 - $subLineTwoWidth) / 2)
[void](Draw-SpacedText -Graphics $graphics -Text $subLineOne -Font $heroSubFont -Brush $mutedBrush -X $subLineOneX -Y 338 -Tracking 1.8)
[void](Draw-SpacedText -Graphics $graphics -Text $subLineTwo -Font $heroSubFont -Brush $mutedBrush -X $subLineTwoX -Y 362 -Tracking 1.8)
$graphics.DrawString(
  'Track large wallet activity, score what matters, and get a usable signal feed across ETH, BTC, and Base.',
  $heroBodyFont,
  $whiteBrush,
  [System.Drawing.RectangleF]::new(82, 402, 520, 64),
  $centerFormat
)
[void](Draw-Chip -Graphics $graphics -Text 'CONNECT WALLET TO EXPLORE BETA' -X 165 -Y 486 -Font $chipFont -FillHex '#6c63ff' -FillAlpha 255 -BorderHex '#6c63ff' -BorderAlpha 255 -TextHex '#ffffff')
$graphics.DrawString(
  'Works with Coinbase Wallet, MetaMask, Rainbow, and any WalletConnect wallet.',
  $heroHintFont,
  $dimBrush,
  [System.Drawing.RectangleF]::new(82, 548, 520, 22),
  $centerFormat
)

$panelPath = New-RoundedRectPath -X 726 -Y 116 -Width 414 -Height 418 -Radius 16
$panelFill = [System.Drawing.SolidBrush]::new((New-HexColor '#0d1525'))
$panelBorder = [System.Drawing.Pen]::new((New-HexColor '#1e2d45'), 1.0)
$graphics.FillPath($panelFill, $panelPath)
$graphics.DrawPath($panelBorder, $panelPath)
$panelFill.Dispose()
$panelBorder.Dispose()
$panelPath.Dispose()

$liveDotBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#00e5a0'))
$liveLabelBrush = [System.Drawing.SolidBrush]::new((New-HexColor '#00e5a0'))
$graphics.FillEllipse($liveDotBrush, 752, 142, 8, 8)
$liveDotBrush.Dispose()
$graphics.DrawString('LIVE SIGNALS', $panelLabelFont, $liveLabelBrush, [System.Drawing.RectangleF]::new(770, 138, 100, 16))
$liveLabelBrush.Dispose()
$graphics.DrawString(('82% accuracy ' + [char]0x00B7 + ' 24 signals tracked'), $headerMetaFont, $mutedBrush, [System.Drawing.RectangleF]::new(884, 138, 214, 16))

Draw-LiveSignalCard -Graphics $graphics -X 746 -Y 178 -Width 374 -Chain 'BASE' -Headline 'Whale bridge inflow detected on Base' -Value '$3.4M moved' -Time '2m ago' -ChainHex '#0052ff' -ChainFont $chainFont -BadgeFont $badgeFont -BodyFont $cardBodyFont -MetaFont $cardMetaFont
Draw-LiveSignalCard -Graphics $graphics -X 746 -Y 286 -Width 374 -Chain 'ETH' -Headline 'Smart wallet entered before momentum expanded' -Value '$1.1M moved' -Time '11m ago' -ChainHex '#6c63ff' -ChainFont $chainFont -BadgeFont $badgeFont -BodyFont $cardBodyFont -MetaFont $cardMetaFont
Draw-LiveSignalCard -Graphics $graphics -X 746 -Y 394 -Width 374 -Chain 'BTC' -Headline 'Large transfer flagged for follow-through watch' -Value '$8.2M moved' -Time '38m ago' -ChainHex '#f7931a' -ChainFont $chainFont -BadgeFont $badgeFont -BodyFont $cardBodyFont -MetaFont $cardMetaFont

$graphics.DrawString(
  'Open beta access is live for connected wallets.',
  $heroHintFont,
  $dimBrush,
  [System.Drawing.RectangleF]::new(746, 500, 374, 18)
)

$centerFormat.Dispose()

$outputDir = Split-Path -Path $OutputPath -Parent
if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$mutedBrush.Dispose()
$dimBrush.Dispose()
$whiteBrush.Dispose()
$badgeFont.Dispose()
$cardMetaFont.Dispose()
$cardBodyFont.Dispose()
$chainFont.Dispose()
$panelLabelFont.Dispose()
$chipFont.Dispose()
$heroHintFont.Dispose()
$heroBodyFont.Dispose()
$heroSubFont.Dispose()
$heroTitleFont.Dispose()
$headerMetaFont.Dispose()
$headerLogoFont.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
