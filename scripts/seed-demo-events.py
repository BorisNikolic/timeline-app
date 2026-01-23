#!/usr/bin/env python3
"""
Seed demo events for Pyramid Festival 2026 timeline.
Run: python scripts/seed-demo-events.py
"""

import requests
import getpass
import sys

API_URL = "https://festival-timeline-api.onrender.com"
TIMELINE_ID = "297aea13-2d77-41fb-8673-f90b650e60fd"

# Category mapping (name -> id, will be populated after fetching)
CATEGORIES = {}

# Demo events organized by date
DEMO_EVENTS = [
    # Today - Jan 23 (Thursday)
    {"date": "2026-01-23", "time": "10:00", "endTime": "11:00", "title": "Morning Kundalini Yoga - Daya Padmani", "category": "Tok", "description": "Start your day with energizing kundalini yoga practice"},
    {"date": "2026-01-23", "time": "11:30", "endTime": "12:30", "title": "Sound Bath Meditation", "category": "Tok", "description": "Deep relaxation with crystal singing bowls and gongs"},
    {"date": "2026-01-23", "time": "14:00", "endTime": "16:00", "title": "DJ Fernanda Pistelli", "category": "Kolo", "description": "Opening afternoon set with organic house vibes"},
    {"date": "2026-01-23", "time": "16:00", "endTime": "17:30", "title": "Live Mural Painting - Borme Studio", "category": "Art", "description": "Watch artists create a live mural inspired by nature"},
    {"date": "2026-01-23", "time": "18:00", "endTime": "20:00", "title": "Live Band - Middle Mode", "category": "Kolo", "description": "Electronic live band performance"},
    {"date": "2026-01-23", "time": "20:00", "endTime": "22:00", "title": "DJ Burn in Noise", "category": "Kolo", "description": "Progressive psytrance journey"},
    {"date": "2026-01-23", "time": "22:00", "endTime": "23:59", "title": "DJ Stole", "category": "Kolo", "description": "Late night techno session"},

    # Tomorrow - Jan 24 (Friday)
    {"date": "2026-01-24", "time": "09:00", "endTime": "10:00", "title": "Sunrise Meditation Circle", "category": "Tok", "description": "Guided morning meditation in nature"},
    {"date": "2026-01-24", "time": "11:00", "endTime": "12:30", "title": "Talk: Balkan Pyramid Network - Semir Osmanagic", "category": "Tok", "description": "Explore the mysteries of Bosnian pyramids"},
    {"date": "2026-01-24", "time": "13:00", "endTime": "14:00", "title": "Dreamcatcher Workshop - Marija Nikolic", "category": "Art", "description": "Create your own dreamcatcher from reclaimed textiles"},
    {"date": "2026-01-24", "time": "15:00", "endTime": "17:00", "title": "Afternoon Sessions - Various DJs", "category": "Kolo", "description": "Chill afternoon grooves"},
    {"date": "2026-01-24", "time": "18:00", "endTime": "20:00", "title": "Headliner Set - TBA", "category": "Kolo", "description": "Special guest headliner performance"},
    {"date": "2026-01-24", "time": "21:00", "endTime": "23:00", "title": "Evening Grooves", "category": "Kolo", "description": "Deep house and melodic techno"},
    {"date": "2026-01-24", "time": "23:00", "endTime": "23:59", "title": "Late Night Sessions", "category": "Kolo", "description": "Dance into the night"},

    # Sunday - Jan 26
    {"date": "2026-01-26", "time": "10:00", "endTime": "11:30", "title": "Free Your Voice - Singing Workshop", "category": "Tok", "description": "Express yourself through voice and song with Katarina Kacun"},
    {"date": "2026-01-26", "time": "12:00", "endTime": "13:00", "title": "Medicinal Plants of Rtanj - Momcilo Antonijevic", "category": "Tok", "description": "Learn about local healing herbs and their uses"},
    {"date": "2026-01-26", "time": "15:00", "endTime": "17:00", "title": "Closing Ceremony Set", "category": "Kolo", "description": "Special closing ceremony performance"},
    {"date": "2026-01-26", "time": "17:00", "endTime": "18:00", "title": "Thank You Gathering", "category": "Tok", "description": "Community gathering to share gratitude"},
    {"date": "2026-01-26", "time": "19:00", "endTime": "21:00", "title": "Final Performance", "category": "Kolo", "description": "The grand finale performance"},
    {"date": "2026-01-26", "time": "21:00", "endTime": "23:00", "title": "Closing Party", "category": "Kolo", "description": "Last dance of the festival"},
]


def login(email: str, password: str) -> str:
    """Authenticate and return JWT token."""
    print("Logging in...")
    resp = requests.post(f"{API_URL}/api/auth/login", json={"email": email, "password": password})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        sys.exit(1)
    token = resp.json().get("token")
    print("Login successful!")
    return token


def get_categories(token: str) -> dict:
    """Fetch existing categories for the timeline."""
    resp = requests.get(
        f"{API_URL}/api/timelines/{TIMELINE_ID}/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    if resp.status_code != 200:
        print(f"Failed to fetch categories: {resp.text}")
        sys.exit(1)

    categories = {}
    for cat in resp.json():
        categories[cat["name"]] = cat["id"]
    return categories


def create_category(token: str, name: str, color: str) -> str:
    """Create a new category and return its ID."""
    resp = requests.post(
        f"{API_URL}/api/timelines/{TIMELINE_ID}/categories",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": name, "color": color}
    )
    if resp.status_code == 201:
        cat_id = resp.json()["id"]
        print(f"  Created category: {name}")
        return cat_id
    else:
        print(f"  Failed to create category {name}: {resp.text}")
        return None


def ensure_categories(token: str) -> dict:
    """Ensure all needed categories exist."""
    print("\nChecking categories...")
    categories = get_categories(token)
    print(f"  Existing: {list(categories.keys())}")

    # Categories we need with their colors
    needed = {
        "Kolo": "#14B8A6",    # Teal
        "Tok": "#F59E0B",     # Amber
        "Art": "#8B5CF6",     # Purple
    }

    for name, color in needed.items():
        if name not in categories:
            cat_id = create_category(token, name, color)
            if cat_id:
                categories[name] = cat_id

    return categories


def create_event(token: str, event: dict, categories: dict) -> bool:
    """Create a single event."""
    category_id = categories.get(event["category"])
    if not category_id:
        print(f"  Skipping '{event['title']}': category '{event['category']}' not found")
        return False

    payload = {
        "title": event["title"],
        "date": event["date"],
        "time": event["time"],
        "endTime": event["endTime"],
        "description": event.get("description", ""),
        "categoryId": category_id,
        "status": "Not Started",
        "priority": "Medium"
    }

    resp = requests.post(
        f"{API_URL}/api/timelines/{TIMELINE_ID}/events",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )

    if resp.status_code == 201:
        return True
    else:
        print(f"  Failed to create '{event['title']}': {resp.text}")
        return False


def seed_events(token: str, categories: dict):
    """Create all demo events."""
    print(f"\nCreating {len(DEMO_EVENTS)} demo events...")

    success = 0
    for event in DEMO_EVENTS:
        if create_event(token, event, categories):
            success += 1
            print(f"  [{success}/{len(DEMO_EVENTS)}] {event['date']} {event['time']} - {event['title']}")

    print(f"\nCreated {success}/{len(DEMO_EVENTS)} events successfully!")


def main():
    print("=" * 50)
    print("Pyramid Festival 2026 - Demo Event Seeder")
    print("=" * 50)
    print(f"\nTimeline: {TIMELINE_ID}")
    print(f"API: {API_URL}")

    # Get credentials from args or prompt
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        password = sys.argv[2]
    else:
        email = input("\nEmail: ")
        password = getpass.getpass("Password: ")

    # Authenticate
    token = login(email, password)

    # Ensure categories exist
    categories = ensure_categories(token)

    # Create events
    seed_events(token, categories)

    print("\n" + "=" * 50)
    print("Done! Check your timeline:")
    print(f"  Web: https://borisnikolic.github.io/timeline-app/timeline/{TIMELINE_ID}")
    print("=" * 50)


if __name__ == "__main__":
    main()
