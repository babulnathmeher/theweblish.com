$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$dataDir = Join-Path $projectRoot ".npm-cache\db-backups\2026-10-13-pre-portfolio\restore-mariadb"
$resolvedDataDir = (Resolve-Path -LiteralPath $dataDir).Path
if (-not $resolvedDataDir.StartsWith($projectRoot + "\", [StringComparison]::OrdinalIgnoreCase)) {
  throw "The isolated data directory is outside this project."
}
$config = Join-Path $resolvedDataDir "my.ini"
$server = "C:\xampp\mysql\bin\mysqld.exe"
if (-not (Test-Path -LiteralPath $config) -or -not (Test-Path -LiteralPath $server)) {
  throw "The isolated MariaDB installation is unavailable. See docs/database-recovery.md."
}

function Test-IsolatedDatabase {
  $connection = [System.Net.Sockets.TcpClient]::new()
  try {
    $connection.Connect("127.0.0.1", 3317)
    return $true
  } catch {
    return $false
  } finally {
    $connection.Dispose()
  }
}

if (Test-IsolatedDatabase) {
  Write-Output "Isolated development MariaDB is already running on 127.0.0.1:3317."
  exit 0
}

Start-Process -FilePath $server -ArgumentList @("--defaults-file=$config", "--bind-address=127.0.0.1") -WindowStyle Hidden | Out-Null
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Milliseconds 500
  if (Test-IsolatedDatabase) {
    Write-Output "Isolated development MariaDB started on 127.0.0.1:3317."
    exit 0
  }
}
throw "The isolated MariaDB process did not become ready. Inspect its error log in the isolated data directory."
