import httpx
from ..core.config import settings
from ..schemas.event import Event


async def send_discord_notification(event: Event, action: str = "created"):
    """Send a notification to Discord webhook."""
    # Check if Discord webhook URL is configured
    if not settings.DISCORD_WEBHOOK_URL:
        return {"success": False, "message": "Discord webhook URL not configured"}

    # Create message content
    if action == "created":
        title = "🎉 New Event Created"
    elif action == "updated":
        title = "📝 Event Updated"
    else:
        title = "📅 Event Notification"

    # Format the message
    message = {
        "username": "KaigiNote Bot",
        "embeds": [
            {
                "title": title,
                "color": 3447003,  # Blue color
                "fields": [
                    {
                        "name": "Event",
                        "value": f"ID: {event.id}",
                        "inline": True
                    },
                    {
                        "name": "Date",
                        "value": event.start_time.strftime("%Y-%m-%d %H:%M"),
                        "inline": True
                    },
                    {
                        "name": "Place",
                        "value": event.place,
                        "inline": True
                    },
                    {
                        "name": "Content",
                        "value": event.content or "No description provided",
                        "inline": False
                    },
                    {
                        "name": "Status",
                        "value": event.status,
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "KaigiNote"
                }
            }
        ]
    }

    # Send the message to Discord
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.DISCORD_WEBHOOK_URL,
                json=message
            )
            response.raise_for_status()
        return {"success": True, "message": "Notification sent to Discord"}
    except Exception as e:
        return {"success": False, "message": f"Failed to send Discord notification: {str(e)}"}
