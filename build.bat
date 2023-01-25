
@rem set the execution mode of the PowerShell
set flag=1

powershell -c rm -r _site/*
powershell -c rm -r .sass-cache/*
powershell -c bundle "exec" "jekyll" "serve" "--future" "--livereload" "--incremental"
