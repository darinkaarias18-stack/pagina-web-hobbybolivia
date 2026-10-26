Add-Type -AssemblyName System.Drawing

$backupPath = "c:\PROYECTOS\pagina-web-hobbybolivia\public\images\banners\banner_precision_aero_original.png"
$srcPath = "c:\PROYECTOS\pagina-web-hobbybolivia\public\images\banners\banner_precision_aero.png"

$bmp = [System.Drawing.Bitmap]::new($backupPath)
Write-Output "Original Size: $($bmp.Width) x $($bmp.Height)"

# Crop past the rounded corners and black border
$cropLeft = 40
$cropTop = 42
$cropRight = 40
$cropBottom = 20

$cropW = $bmp.Width - $cropLeft - $cropRight
$cropH = $bmp.Height - $cropTop - $cropBottom

$rect = [System.Drawing.Rectangle]::new($cropLeft, $cropTop, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)

$cropped.Save($srcPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$cropped.Dispose()
Write-Output "Cleanly cropped to: $cropW x $cropH and saved to $srcPath"
