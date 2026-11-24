param([string]$f)
$utf8 = New-Object System.Text.UTF8Encoding $false
$tmp = Join-Path $PWD.Path "mongo\_tmp.js"
$cab = [System.IO.File]::ReadAllText((Join-Path $PWD.Path "mongo\_cabecalho.js"))
$qry = [System.IO.File]::ReadAllText((Join-Path $PWD.Path $f))
[System.IO.File]::WriteAllText($tmp, $cab + "`n" + $qry, $utf8)
docker cp $tmp mongo-lab:/tmp/q.js | Out-Null
$out = docker exec mongo-lab mongosh --quiet logiporto --file /tmp/q.js
$dest = $f -replace '\.js$','.out.txt'
$out | Out-File -Encoding utf8 $dest
$out
Remove-Item $tmp