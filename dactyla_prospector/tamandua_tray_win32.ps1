# DACTYLA CODE // TAMANDUÁ NATIVE SYSTEM TRAY FOR WINDOWS (GDI+ NOTIFYICON)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$statusFile = Join-Path $scriptDir "tamandua_status.json"

function Create-StatusIcon($colorHex) {
    $bmp = New-Object System.Drawing.Bitmap(16, 16)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    $color = [System.Drawing.ColorTranslator]::FromHtml($colorHex)
    $brush = New-Object System.Drawing.SolidBrush($color)
    $g.FillEllipse($brush, 1, 1, 14, 14)
    
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 1)
    $g.DrawEllipse($pen, 1, 1, 13, 13)
    
    $g.Dispose()
    $hIcon = $bmp.GetHicon()
    return [System.Drawing.Icon]::FromHandle($hIcon)
}

$tray = New-Object System.Windows.Forms.NotifyIcon
$tray.Text = "Tamanduá Dactyla Code"
$tray.Visible = $true

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$itemTitle = New-Object System.Windows.Forms.ToolStripMenuItem("🦡 Tamanduá Dactyla Code")
$itemTitle.Font = New-Object System.Drawing.Font($itemTitle.Font, [System.Drawing.FontStyle]::Bold)
$itemTitle.Enabled = $false
$contextMenu.Items.Add($itemTitle) | Out-Null

$itemStatus = New-Object System.Windows.Forms.ToolStripMenuItem("Status: Carregando...")
$itemStatus.Enabled = $false
$contextMenu.Items.Add($itemStatus) | Out-Null

$contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

$itemRefresh = New-Object System.Windows.Forms.ToolStripMenuItem("🔄 Atualizar Status")
$itemRefresh.Add_Click({ Update-TrayStatus })
$contextMenu.Items.Add($itemRefresh) | Out-Null

$itemExit = New-Object System.Windows.Forms.ToolStripMenuItem("❌ Sair do Tamanduá Tray")
$itemExit.Add_Click({ 
    $tray.Visible = $false
    $tray.Dispose()
    [System.Windows.Forms.Application]::Exit()
})
$contextMenu.Items.Add($itemExit) | Out-Null

$tray.ContextMenuStrip = $contextMenu

function Update-TrayStatus {
    if (Test-Path $statusFile) {
        try {
            $json = Get-Content $statusFile -Raw | ConvertFrom-Json
            $status = $json.status
            
            if ($status -eq "GREEN") {
                $tray.Icon = Create-StatusIcon "#10B981"
                $itemStatus.Text = "Status: VERDE (Operacional)"
                $tray.Text = "Tamandua Dactyla: Operacao 100% Saudavel"
            } elseif ($status -eq "YELLOW") {
                $tray.Icon = Create-StatusIcon "#F59E0B"
                $itemStatus.Text = "Status: AMARELO (Atencao)"
                $tray.Text = "Tamandua Dactyla: Fila de Leads Vazia"
            } else {
                $tray.Icon = Create-StatusIcon "#EF4444"
                $itemStatus.Text = "Status: VERMELHO (Alerta)"
                $tray.Text = "Tamandua Dactyla: Erro Critico / Offline"
            }
        } catch {
            $tray.Icon = Create-StatusIcon "#6B7280"
            $itemStatus.Text = "Status: Cinza (Erro de leitura)"
        }
    } else {
        $tray.Icon = Create-StatusIcon "#10B981"
        $tray.Text = "Tamandua Dactyla Code"
    }
}

Update-TrayStatus

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 5000
$timer.Add_Tick({ Update-TrayStatus })
$timer.Start()

[System.Windows.Forms.Application]::Run()
