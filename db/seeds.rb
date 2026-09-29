# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# ── Skills catalogue ──────────────────────────────────────────────────────────

skills = [
  # Belay
  { name: "Top Rope Belay",  category: "belay",   description: "Belaying a top-rope climber" },
  { name: "Lead Belay",      category: "belay",   description: "Belaying a lead climber" },
  { name: "Guide Mode Belay",category: "belay",   description: "Plaquette device in guide/autoblock mode" },

  # Lead
  { name: "Sport Lead",      category: "lead",    description: "Leading on bolted sport routes" },
  { name: "Trad Lead",       category: "lead",    description: "Placing and leading on traditional protection" },
  { name: "Aid Lead",        category: "lead",    description: "Leading on aid routes" },
  { name: "Cleaning",        category: "lead",    description: "Removing quickdraws/protection while following a pitch" },

  # Anchor building
  { name: "Sport Anchor",    category: "anchor",  description: "Building anchors at bolted stations" },
  { name: "Trad Anchor",     category: "anchor",  description: "Building natural protection anchors" },
  { name: "Equalised Anchor",category: "anchor",  description: "Building SRENE/EARNL equalised anchors" },

  # Rappel / descent
  { name: "Rappel",          category: "descent", description: "Single and double rope rappelling" },
  { name: "Simul-rappel",    category: "descent", description: "Two-person simultaneous rappel" },
  { name: "Downclimbing",    category: "descent", description: "Downclimbing moderate terrain unroped" },

  # Movement
  { name: "Multipitch",      category: "movement", description: "Managing a multipitch route" },
  { name: "Simul-climbing",  category: "movement", description: "Moving simultaneously on a rope team" },
  { name: "Ice Climbing",    category: "movement", description: "Waterfall ice and alpine ice" },
  { name: "Alpine Climbing", category: "movement", description: "Mixed snow, ice and rock alpine routes" },

  # Self-rescue
  { name: "Hauling",         category: "rescue",  description: "Z-pulley and other hauling systems" },
  { name: "Rope Passing",    category: "rescue",  description: "Passing a knot while rappelling or lowering" },
  { name: "Crevasse Rescue", category: "rescue",  description: "Glacier travel and crevasse extraction" },

  # Navigation
  { name: "Map & Compass",   category: "navigation", description: "Topographic map reading and compass use" },
  { name: "GPS Navigation",  category: "navigation", description: "Using GPS devices or apps off-trail" },
]

skills.each do |attrs|
  Skill.find_or_create_by!(name: attrs[:name]) do |s|
    s.category    = attrs[:category]
    s.description = attrs[:description]
  end
end
puts "Seeded #{Skill.count} skills"

# ── Gear catalogue ─────────────────────────────────────────────────────────────
# Rock climbing catalogue (personal/sport/trad/anchoring/multipitch) is the
# full assorted-gear list. Alpine/ice and safety/emergency items are a
# separate domain the list doesn't cover, so they're kept as-is alongside it.

gear = [
  # Core Personal Gear
  { name: "Climbing Helmet",                        category: "personal" },
  { name: "Climbing Harness",                       category: "personal" },
  { name: "Climbing Shoes",                         category: "personal" },
  { name: "Chalk Bag",                               category: "personal" },
  { name: "60m Dynamic Single Rope",                 category: "personal" },
  { name: "70m Dynamic Single Rope",                 category: "personal" },
  { name: "60m Dynamic Half Rope",                   category: "personal" },
  { name: "70m Dynamic Half Rope",                   category: "personal" },
  { name: "Assisted Braking Belay Device",           category: "personal" },
  { name: "Guide Mode Tubular Belay Device",         category: "personal" },
  { name: "HMS Locking Carabiner Screw Gate",        category: "personal" },
  { name: "HMS Locking Carabiner Auto Lock",         category: "personal" },
  { name: "D Style Locking Carabiner Screw Gate",    category: "personal" },
  { name: "D Style Locking Carabiner Auto Lock",     category: "personal" },

  # Sport Climbing Gear
  { name: "12cm Quickdraw",                          category: "sport" },
  { name: "16cm Quickdraw",                          category: "sport" },
  { name: "17cm Quickdraw",                          category: "sport" },
  { name: "25cm Quickdraw",                          category: "sport" },
  { name: "Telescoping Stick Clip",                  category: "sport" },

  # Trad Climbing Gear
  { name: "Small Wire Nut Size 1",                   category: "trad" },
  { name: "Small Wire Nut Size 2",                   category: "trad" },
  { name: "Small Wire Nut Size 3",                   category: "trad" },
  { name: "Medium Wire Nut Size 4",                  category: "trad" },
  { name: "Medium Wire Nut Size 5",                  category: "trad" },
  { name: "Medium Wire Nut Size 6",                  category: "trad" },
  { name: "Medium Wire Nut Size 7",                  category: "trad" },
  { name: "Medium Wire Nut Size 8",                  category: "trad" },
  { name: "Large Wire Nut Size 9",                   category: "trad" },
  { name: "Large Wire Nut Size 10",                  category: "trad" },
  { name: "Large Wire Nut Size 11",                  category: "trad" },
  { name: "Large Wire Nut Size 12",                  category: "trad" },
  { name: "Micro Camming Device Size 0.1",           category: "trad" },
  { name: "Micro Camming Device Size 0.2",           category: "trad" },
  { name: "Small Camming Device Size 0.3",           category: "trad" },
  { name: "Small Camming Device Size 0.4",           category: "trad" },
  { name: "Small Camming Device Size 0.5",           category: "trad" },
  { name: "Medium Camming Device Size 0.75",         category: "trad" },
  { name: "Medium Camming Device Size 1",            category: "trad" },
  { name: "Medium Camming Device Size 2",            category: "trad" },
  { name: "Large Camming Device Size 3",             category: "trad" },
  { name: "Large Camming Device Size 4",             category: "trad" },
  { name: "Large Camming Device Size 5",             category: "trad" },
  { name: "Large Camming Device Size 6",             category: "trad" },
  { name: "Nut Extraction Tool",                     category: "trad" },
  { name: "60cm Alpine Draw",                        category: "trad" },
  { name: "120cm Alpine Draw",                       category: "trad" },
  { name: "Non Locking Wiregate Carabiner",          category: "trad" },
  { name: "6m Cordelette Accessory Cord 7mm",        category: "trad" },

  # Top Rope Anchoring Gear
  { name: "5m Cordelette Accessory Cord 7mm",        category: "anchoring" },
  { name: "240cm Sewn Nylon Sling",                  category: "anchoring" },
  { name: "120cm Sewn Nylon Sling",                  category: "anchoring" },
  { name: "120cm Sewn Dyneema Sling",                category: "anchoring" },

  # Multi Pitch and Specialist Gear
  { name: "Multi Link Personal Anchor System",       category: "multipitch" },
  { name: "120cm Sewn Webbing Tether",                category: "multipitch" },
  { name: "Edelrid OHM First Bolt Resistor",          category: "multipitch" },
  { name: "Mechanical Handle Ascender Left",          category: "multipitch" },
  { name: "Mechanical Handle Ascender Right",         category: "multipitch" },
  { name: "Emergency Ultra Light Ascender",           category: "multipitch" },
  { name: "6mm Prusik Cord Loop",                     category: "multipitch" },
  { name: "6mm Autoblock Cord Loop",                  category: "multipitch" },
  { name: "Lightweight Rope Extraction Emergency Knife", category: "multipitch" },

  # Ice / alpine
  { name: "Ice Axe",                  category: "alpine",     description: "Straight-pick mountaineering axe" },
  { name: "Technical Ice Axes (pair)",category: "alpine",     description: "Bent-pick technical tools" },
  { name: "Crampons",                 category: "alpine",     description: "Step-in or strap crampons" },
  { name: "Snow Picket",              category: "alpine",     description: "Aluminium snow picket" },
  { name: "Ice Screws",               category: "alpine",     description: "Set of ice screws (≥3)" },

  # First aid / emergency
  { name: "First Aid Kit",            category: "safety",     description: "Backcountry first aid kit" },
  { name: "SAM Splint",               category: "safety",     description: "Malleable SAM splint" },
  { name: "Emergency Bivy",           category: "safety",     description: "Space blanket or emergency bivy sack" },
  { name: "Headlamp",                 category: "safety",     description: "Rechargeable or battery headlamp with extra batteries" },
]

gear.each do |attrs|
  GearItem.find_or_create_by!(name: attrs[:name]) do |g|
    g.category    = attrs[:category]
    g.description = attrs[:description]
  end
end

# The rock-climbing catalogue above supersedes the old generic placeholder
# names it was built from (e.g. "Helmet" -> "Climbing Helmet", "#0.3 Cam" ->
# "Small Camming Device Size 0.3", "Nut Set" -> individual sized nuts).
# None of these are referenced by any trip_gear_items/user_gear_items, so
# they're safe to drop outright rather than leaving stale duplicates around.
superseded_gear_names = [
  "Single Rope (dry)", "Single Rope (standard)", "Half Ropes", "Cordelette",
  "Tagline (skinny)", "Grigri", "ATC / Tube Device", "Ohm",
  "#0.3 Cam", "#0.5 Cam", "#0.75 Cam", "#1 Cam", "#2 Cam", "#3 Cam", "#4 Cam",
  "Nut Set", "Micro Nuts", "Ball Nuts / Offset Nuts", "Hex Set",
  "Big Bros / Offset Cams", "Locking Carabiner", "Non-locking Carabiners",
  "120cm Sling", "60cm Sling", "Personal Anchor System",
  "Helmet", "Harness", "Approach Shoes",
]
GearItem.where(name: superseded_gear_names).destroy_all

puts "Seeded #{GearItem.count} gear items"


