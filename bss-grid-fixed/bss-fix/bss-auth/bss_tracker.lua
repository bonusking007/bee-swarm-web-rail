-- Bee Swarm Simulator — Farm Tracker Heartbeat
-- ใช้ GetLocalPlayerStats จาก ReplicatedStorage (ไม่ต้องเปิด UI)

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer

local req = http_request or request or (syn and syn.request)
assert(req, "executor ไม่รองรับ http_request")

local API_URL = "https://trustworthy-reverence-production.up.railway.app/api/update"
local API_KEY = "seashop"

getgenv().BSS_SESSION = getgenv().BSS_SESSION or HttpService:GenerateGUID(false)
local SESSION = getgenv().BSS_SESSION

-- ใช้ GetLocalPlayerStats เหมือน webhook script
local GetLocalPlayerStats = require(ReplicatedStorage.GetLocalPlayerStats)

local stats = player.CoreStats

-- ดึง inventory จาก ReplicatedStorage โดยตรง (key เป็น CamelCase)
local function getInventory()
    local inv = {}
    local ok, statsData = pcall(function()
        return GetLocalPlayerStats()
    end)
    if not ok or not statsData or not statsData.Eggs then return inv end
    for key, count in pairs(statsData.Eggs) do
        if type(count) == "number" and count > 0 then
            inv[key] = count
        end
    end
    return inv
end

-- ดึง Bear Quest ที่ active
local function getActiveQuest()
    local ok, frame = pcall(function()
        return player.PlayerGui.ScreenGui.Menus.Children.Quests.Content.Frame
    end)
    if not ok or not frame then return nil end
    for _, box in ipairs(frame:GetChildren()) do
        if box:IsA("Frame") then
            local tb = box:FindFirstChild("TitleBarBG")
            if tb then
                for _, d in ipairs(tb:GetDescendants()) do
                    if d:IsA("TextLabel") and d.Text and d.Text ~= "" then
                        return d.Text
                    end
                end
            end
        end
    end
    return nil
end

local function snapshot()
    return {
        username    = player.Name,
        userId      = player.UserId,
        session     = SESSION,
        online      = true,
        honey       = stats.Honey.Value,
        pollen      = stats.Pollen.Value,
        capacity    = stats.Capacity.Value,
        tickets     = stats.Tickets and stats.Tickets.Value or 0,
        royalJelly  = stats.RoyalJelly and stats.RoyalJelly.Value or 0,
        bees        = stats.BeeCount and stats.BeeCount.Value or 0,
        inventory   = getInventory(),
        activeQuest = getActiveQuest(),
        ts          = os.time(),
    }
end

local function send(payload)
    local ok, res = pcall(function()
        return req({
            Url     = API_URL,
            Method  = "POST",
            Headers = { ["Content-Type"] = "application/json", ["X-API-Key"] = API_KEY },
            Body    = HttpService:JSONEncode(payload),
            Timeout = 10,
        })
    end)
    if ok and res then
        print("[BSS Tracker] Sent:", res.StatusCode or "?")
    else
        warn("[BSS Tracker] Failed:", res)
    end
end

send(snapshot())

task.spawn(function()
    while task.wait(15) do
        if not player.Parent then break end
        send(snapshot())
    end
end)

print("[BSS Tracker] ✅ โหลดสำเร็จ — ส่งข้อมูลทุก 15 วิ")
