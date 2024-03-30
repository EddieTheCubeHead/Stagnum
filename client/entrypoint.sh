#!/bin/sh

echo "Check that we have NEXT_PUBLIC_FRONTEND_URI vars $NEXT_PUBLIC_FRONTEND_URI"
test -n "$NEXT_PUBLIC_FRONTEND_URI"


Echo "Check that we have NEXT_PUBLIC_BACKEND_URI vars $NEXT_PUBLIC_BACKEND_URI"
test -n "$NEXT_PUBLIC_BACKEND_URI"


find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_FRONTEND_URI#$NEXT_PUBLIC_FRONTEND_URI#g"
find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_BACKEND_URI#$NEXT_PUBLIC_BACKEND_URI#g"

echo "Starting Nextjs"
exec "$@"