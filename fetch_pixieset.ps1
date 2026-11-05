$galleries = @(
  'https://theweddingarchitect25.pixieset.com/vaishaliandatharva/',
  'https://theweddingarchitect25.pixieset.com/tishaandharsh/',
  'https://theweddingarchitect25.pixieset.com/kajolandprasad/',
  'https://theweddingarchitect25.pixieset.com/ayeshaandandres/',
  'https://theweddingarchitect25.pixieset.com/nehaandaniruddh/',
  'https://theweddingarchitect25.pixieset.com/pratikkanaka/',
  'https://theweddingarchitect25.pixieset.com/snehaandashish/',
  'https://theweddingarchitect25.pixieset.com/jayeshandrakshita/',
  'https://theweddingarchitect25.pixieset.com/sohamandayushi/',
  'https://theweddingarchitect25.pixieset.com/roshniandsoham/'
)

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

foreach ($url in $galleries) {
  try {
    $r = Invoke-WebRequest -Uri $url -UserAgent $ua -UseBasicParsing -TimeoutSec 15
    $html = $r.Content

    # Try pattern: property="og:image" content="URL"
    $m = [regex]::Match($html, 'property=["]og:image["][^>]+content=["]([^"]+)["]')
    if (-not $m.Success) {
      $m = [regex]::Match($html, 'content=["]([^"]+)["][^>]+property=["]og:image["]')
    }
    if (-not $m.Success) {
      $m = [regex]::Match($html, 'og:image.*?content=["]([^"]+)["]')
    }

    $imgUrl = $m.Groups[1].Value
    Write-Host "$url => $imgUrl"
  }
  catch {
    Write-Host "$url => ERROR: $($_.Exception.Message)"
  }
}
