Write-Host "Packaging hode-hospital for deployment..."
Remove-Item temp -Recurse -ErrorAction Ignore
New-Item temp -ItemType "directory" -ErrorAction Ignore | Out-Null
# Создание файла с информацией о сборке
New-Item temp\buildinfo.md | Out-Null
if ($env:GITHUB_WORKFLOW) {
  $archive = "who_master_"+$env:REACT_APP_BUILD+".zip"
  Add-Content temp\buildinfo.md "GitHub Actions - $env:GITHUB_WORKFLOW"
  Add-Content temp\buildinfo.md ""
  Add-Content temp\buildinfo.md "Repository: $env:GITHUB_REPOSITORY"
  Add-Content temp\buildinfo.md "Branch: $env:GITHUB_REF"
  Add-Content temp\buildinfo.md "Reason: $env:GITHUB_EVENT_NAME"
  Add-Content temp\buildinfo.md "Build: $env:REACT_APP_BUILD"
  Add-Content temp\buildinfo.md "Source: $env:GITHUB_SHA"
} else {
  $build = (Get-Date).ToString("yyyyMMdd.hhmm")
  $archive = "who_custom_"+(Get-Date).ToString("yyyyMMdd.HHmm")
  $number = 1
  while (Test-Path (Join-Path "dist" ($archive+"."+$number.ToString("00")+".zip"))) { $number++ }
  $archive = $archive+"."+$number.ToString("00")+".zip"
  Add-Content temp\buildinfo.md "Custom Build - $env:OS"
  Add-Content temp\buildinfo.md ""
  Add-Content temp\buildinfo.md "Repository:"
  Add-Content temp\buildinfo.md "Branch: custom"
  Add-Content temp\buildinfo.md "Reason:"
  Add-Content temp\buildinfo.md "Build: $build"
  Add-Content temp\buildinfo.md "Source:"
}
Add-Content temp\buildinfo.md ""
Add-Content temp\buildinfo.md "StaticAssets:"
Get-ChildItem client\static\js | Foreach-Object { Add-Content temp\buildinfo.md $_.Name }
Get-ChildItem client\static\css | Foreach-Object { Add-Content temp\buildinfo.md $_.Name }
Get-ChildItem client\static\media | Foreach-Object { Add-Content temp\buildinfo.md $_.Name }
# Копирование файлов
Copy-Item api -Destination temp\api -Recurse
Copy-Item app -Destination temp\app -Recurse
Copy-Item client -Destination temp\client -Recurse
# ((Get-Content client\index.html -Raw) -replace '/static/','/static/') | Set-Content temp\client\index.html
Copy-Item report -Destination temp\report -Recurse
Copy-Item sql -Destination temp\sql -Recurse
Copy-Item changelog.md -Destination temp\changelog.md
Copy-Item LICENSE -Destination temp\LICENSE
Copy-Item README.md -Destination temp\README.md
Copy-Item who.js -Destination temp\who.js
$packagejson = Get-Content package.json | ConvertFrom-Json
$packagejson.PSObject.Properties.Remove("scripts")
$packagejson.PSObject.Properties.Remove("devDependencies")
$packagejson.PSObject.Properties.Remove("eslintConfig")
$packagejson.PSObject.Properties.Remove("browserslist")
$packagejson | ConvertTo-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content temp\package.json
$version = $packagejson | Select -ExpandProperty "version"
"process.env.SERVER_VERSION = '$version';" | Set-Content temp\app\server.js
Add-Content temp\app\server.js (Get-Content app\server.js)
# Упаковка файлов
New-Item dist -ItemType "directory" -ErrorAction Ignore | Out-Null
Compress-Archive -Path "temp\*" -DestinationPath (Join-Path "dist" $archive)
if ($env:GITHUB_WORKFLOW) {
  Write-Host "PACKAGE_VERSION=$version"
  Write-Host "::set-output name=version::$version"
} else {
  Remove-Item temp -Recurse -ErrorAction Ignore
  Write-Host "node-hospital is packed in ""$archive"""
}
