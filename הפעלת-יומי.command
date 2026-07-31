#!/bin/bash
cd "$(dirname "$0")"
echo "מפעיל את יומי... הדפדפן ייפתח בעוד רגע"
(sleep 4 && open http://localhost:5173) &
npm run dev
