#!/bin/bash
# 1. Start the virtual display
Xvfb :1 -screen 0 1280x800x24 &
sleep 2
export DISPLAY=:1

# 2. Start the window manager
fluxbox &

# 3. Start the VNC server
x11vnc -display :1 -nopw -forever -bg

# 4. Start noVNC using the path we found
/usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &
