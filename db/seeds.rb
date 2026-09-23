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

gear = [
  # Rope
  { name: "Single Rope (dry)",        category: "rope",       description: "60-70m dry-treated single rope" },
  { name: "Single Rope (standard)",   category: "rope",       description: "60-70m non-dry single rope" },
  { name: "Half Ropes",               category: "rope",       description: "Pair of half ropes" },
  { name: "Cordelette",               category: "rope",       description: "7mm cord loop ~5-6m" },
  { name: "Tagline (skinny)",         category: "rope",       description: "6mm static tagline for rappels" },

  # Belay & rappel
  { name: "Grigri",                   category: "belay",      description: "Petzl Grigri or equivalent assisted-braking device" },
  { name: "ATC / Tube Device",        category: "belay",      description: "Reversible tube-style belay device" },
  { name: "Ohm",                      category: "belay",      description: "Edelrid Ohm resistive belay device" },

  # Protection
  { name: "#0.3 Cam",                 category: "protection", description: "e.g. Black Diamond Camalot C4 0.3" },
  { name: "#0.5 Cam",                 category: "protection", description: "e.g. Black Diamond Camalot C4 0.5" },
  { name: "#0.75 Cam",                category: "protection", description: "e.g. Black Diamond Camalot C4 0.75" },
  { name: "#1 Cam",                   category: "protection", description: "e.g. Black Diamond Camalot C4 1" },
  { name: "#2 Cam",                   category: "protection", description: "e.g. Black Diamond Camalot C4 2" },
  { name: "#3 Cam",                   category: "protection", description: "e.g. Black Diamond Camalot C4 3" },
  { name: "#4 Cam",                   category: "protection", description: "e.g. Black Diamond Camalot C4 4" },
  { name: "Nut Set",                  category: "protection", description: "Set of wired stoppers (e.g. DMM Alloy or BD Stoppers)" },
  { name: "Micro Nuts",               category: "protection", description: "Small/micro nut set for thin cracks" },
  { name: "Ball Nuts / Offset Nuts",  category: "protection", description: "Offset or ball nut set" },
  { name: "Hex Set",                  category: "protection", description: "Hexentric nut set for wider cracks" },
  { name: "Big Bros / Offset Cams",   category: "protection", description: "Off-width / wide crack protection" },

  # Carabiners & slings
  { name: "Locking Carabiner",        category: "hardware",   description: "HMS/pear locking biner" },
  { name: "Non-locking Carabiners",   category: "hardware",   description: "Rack of non-lockers (≥10)" },
  { name: "120cm Sling",              category: "hardware",   description: "120cm nylon or Dyneema runner" },
  { name: "60cm Sling",               category: "hardware",   description: "60cm nylon or Dyneema runner" },
  { name: "Personal Anchor System",   category: "hardware",   description: "Adjustable PAS or sewn daisy chain" },

  # Helmets & harnesses
  { name: "Helmet",                   category: "personal",   description: "UIAA/CE certified climbing helmet" },
  { name: "Harness",                  category: "personal",   description: "Rock climbing harness" },
  { name: "Approach Shoes",           category: "personal",   description: "Sticky-rubber approach shoes" },
  { name: "Climbing Shoes",           category: "personal",   description: "Rock climbing shoes" },

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
puts "Seeded #{GearItem.count} gear items"

