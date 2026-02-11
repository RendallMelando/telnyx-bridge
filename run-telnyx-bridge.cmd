@echo off
setlocal
cd /d C:\Users\Rendall\telnyx-bridge

if not exist logs mkdir logs

echo ==== START %date% %time% ====>> logs\bridge.launch.log
whoami >> logs\bridge.launch.log
echo CD IS: %cd% >> logs\bridge.launch.log

"C:\Program Files\nodejs\node.exe" server.js >> logs\bridge.out.log 2>> logs\bridge.err.log

echo ==== EXIT CODE %errorlevel% %date% %time% ====>> logs\bridge.launch.log
exit /b %errorlevel%
