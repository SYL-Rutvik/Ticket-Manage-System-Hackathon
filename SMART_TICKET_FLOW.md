# Smart Ticket Creation Flow — Design Specification

> **Goal:** Guide employees through a structured, step-by-step wizard before a support ticket is created.  
> If the problem can be resolved by the employee themselves using a self-help checklist, no ticket is created.  
> Only unresolvable issues escalate to the support team.

---

## Architecture Overview

```
Employee clicks "New Ticket"
        │
        ▼
  Step 1: Select Problem Category
        │
        ▼
  Step 2: Answer Sub-Questions (specific to category)
        │
        ▼
  Step 3: Self-Help Checklist shown
        │
   ┌────┴────────────────┐
   │                     │
   ▼                     ▼
"Problem Solved"    "Still Not Fixed"
(no ticket)         (proceed to Step 4)
                         │
                         ▼
                   Step 4: Ticket Details form
                   (pre-filled from answers)
                         │
                         ▼
                    Submit Ticket
```

---

## Step 1 — Problem Category Selector

> Employee selects from a main dropdown. Each category has an icon, short label, and a description hint.

| Value | Label | Icon | Description |
|---|---|---|---|
| `internet` | Internet / Network | 🌐 | Wi-Fi, LAN, VPN, Slow connection, Can't browse |
| `printer` | Printer / Scanner | 🖨️ | Printer offline, paper jam, print quality |
| `computer` | Computer / Laptop | 💻 | Won't start, slow, crashed, freezes |
| `software` | Software / Application | 🖥️ | App crashing, login error, feature broken |
| `email` | Email / Outlook | 📧 | Can't send/receive, account locked, missing emails |
| `access` | Access / Permissions | 🔐 | Can't access file, portal, system, or shared drive |
| `phone` | Office Phone / Teams | 📞 | Call quality, Teams login, headset not working |
| `hardware` | Hardware / Peripherals | 🖱️ | Mouse, keyboard, monitor, webcam not working |
| `other` | Other / General | ❓ | Anything that doesn't fit above categories |

---

## Step 2 — Category Sub-Questions

> Dynamic questions shown based on Step 1 selection.  
> Each answer helps auto-fill the ticket AND determine if self-help is appropriate.

---

### 🌐 Internet / Network

**Sub-questions:**
1. **What type of connection are you using?**  
   `[ Wi-Fi ] [ LAN Cable ] [ VPN ] [ Mobile Hotspot ]`

2. **How many people are affected?**  
   `[ Only me ] [ My team ] [ Entire floor ] [ Whole company ]`

3. **What symptom are you experiencing?**  
   `[ No internet at all ] [ Very slow speed ] [ Can't reach specific site ] [ VPN won't connect ]`

4. **When did this start?**  
   `[ Just now ] [ Last few hours ] [ Since yesterday ] [ Past few days ]`

**Self-Help Checklist (shown before ticket creation):**
- [ ] Restart your router/switch or ask premises team to check
- [ ] Unplug the LAN cable and plug it back in
- [ ] Forget the Wi-Fi network and reconnect
- [ ] Check if the issue persists on your phone (same Wi-Fi)
- [ ] Try a different browser
- [ ] Restart your computer

> **✅ If any step solved the issue → "Great! Problem resolved. No ticket needed."**  
> **❌ If none worked → Proceed to full ticket form**

| Self-Resolvable? | Condition |
|---|---|
| ✅ Yes | "Only me" + "Wi-Fi" + power-cycling steps resolve it |
| ❌ No | "My team / floor / company" → immediate escalation (skip self-help) |

---

### 🖨️ Printer / Scanner

**Sub-questions:**
1. **Which printer are you using?**  
   `[ HP LaserJet ] [ Epson ] [ Canon ] [ Shared Office Printer ] [ Other ]`

2. **What is the exact problem?**  
   `[ Printer is offline ] [ Paper jam ] [ Poor print quality ] [ Scanner not working ] [ Printer not found on PC ]`

3. **Is the printer showing any error light or code?**  
   `[ Yes — describe ] [ No ]`

4. **Has this printer worked before on your account?**  
   `[ Yes, it was working ] [ First time setup ]`

**Self-Help Checklist:**
- [ ] Turn the printer OFF, wait 30 seconds, turn it ON
- [ ] Check all paper trays are properly loaded
- [ ] Clear any paper jam by opening all printer doors
- [ ] Re-add the printer: Settings → Devices → Add a printer
- [ ] Set it as the Default Printer and try again
- [ ] Check that the USB or network cable is connected

> **✅ Steps like power-cycling and re-adding printer often fix 70% of printer issues**

| Self-Resolvable? | Condition |
|---|---|
| ✅ Yes | Offline, paper jam, not found — guided fix almost always works |
| ❌ No | Hardware damage, driver install failures, network printer config → ticket |

---

### 💻 Computer / Laptop

**Sub-questions:**
1. **What is happening?**  
   `[ Won't turn on ] [ Freezing/crashing ] [ Very slow ] [ Blue screen (BSOD) ] [ Battery not charging ] [ Display issue ]`

2. **When did this start?**  
   `[ Sudden (right now) ] [ After Windows update ] [ Gradually getting worse ] [ After physically dropping/damage ]`

3. **Can you still access your work?** (to assess impact)  
   `[ Yes via another device ] [ No, completely blocked ]`

4. **What is the Asset Tag of your machine?**  
   `[ Free text input ]`

**Self-Help Checklist:**
- [ ] Restart the computer (if it freezes, hold power 5 sec)
- [ ] Check all cables and power connections
- [ ] Free up disk space if "very slow" (clear Downloads / Recycle Bin)
- [ ] Run Windows Update and restart
- [ ] Run a virus scan

> **✅ Resolvable:** Slowness, minor freeze, browser acting up, blocked by update  
> **❌ Not resolvable:** Won't power on, physical damage, BSOD with error code → ticket required

| Self-Resolvable? | Condition |
|---|---|
| ✅ Yes | "Freezing" + "After update" → prompt Windows safe mode / update rollback guide |
| ❌ No | "Won't turn on" + "After drop" → skip self-help, mark `CRITICAL` priority |

---

### 🖥️ Software / Application

**Sub-questions:**
1. **Which application is affected?**  
   `[ ERP System ] [ CRM ] [ Microsoft Office ] [ Browser ] [ Custom Internal App ] [ Other ]`

2. **What is the error?**  
   `[ App won't open ] [ Login fails ] [ Feature broken ] [ Error message (copy/paste) ] [ App very slow ]`

3. **Does this happen to other people?**  
   `[ Only me ] [ My whole team ] [ Not sure ]`

4. **Did you recently update or change anything?**  
   `[ Yes ] [ No ] [ I'm not sure ]`

**Self-Help Checklist:**
- [ ] Close the app completely and relaunch
- [ ] Clear browser cache (Ctrl+Shift+Delete) if it's browser-based
- [ ] Try a different browser (Chrome vs Edge)
- [ ] Log out and log back in
- [ ] Restart the computer

> **✅ Resolvable:** Cache issues, login session expired, minor app error  
> **❌ Not resolvable:** System-wide outage, "Only me" with persistent login failure after restart → ticket

---

### 📧 Email / Outlook

**Sub-questions:**
1. **What is the problem?**  
   `[ Can't send emails ] [ Not receiving emails ] [ Account locked / password expired ] [ Outlook won't open ] [ Missing emails / folders ] [ Signature / rule issue ]`

2. **Are you using Outlook Desktop or Outlook Web?**  
   `[ Desktop App ] [ Outlook Web (browser) ] [ Mobile App ] [ All of the above ]`

3. **When did this start?**  
   `[ Today ] [ Yesterday ] [ Past few days ] [ After IT changes ]`

**Self-Help Checklist:**
- [ ] Check your internet connection first
- [ ] Try Outlook Web (outlook.office.com) — if that works, the issue is with the desktop app
- [ ] Restart Outlook (File → Exit, then reopen)
- [ ] Check your Spam / Junk folder for missing emails
- [ ] Check if your password has expired (try logging into any Microsoft service)
- [ ] Clear Outlook cache: Close Outlook → Delete OST file → Reopen

> **✅ Resolvable:** Simple login issues, missing email in junk, slow sync  
> **❌ Not resolvable:** Account suspended, server-side issues, locked out entirely → ticket

---

### 🔐 Access / Permissions

**Sub-questions:**
1. **What are you trying to access?**  
   `[ Shared Drive / Folder ] [ Internal Portal or Website ] [ Database ] [ External System ] [ Physical Access (room/cabinet) ]`

2. **What error do you see?**  
   `[ "Access Denied" ] [ Page not loading ] [ Login screen that rejects my credentials ] [ No option to access ]`

3. **Have you ever had this access before?**  
   `[ Yes – it was revoked ] [ No – new access request ] [ Not sure ]`

4. **Is this approved by your manager?**  
   `[ Yes ] [ No, request pending ] [ Not yet asked ]`

**Self-Help Checklist:**
- [ ] Confirm you are connected to the company VPN (if remote)
- [ ] Try logging out and logging back in
- [ ] Check if your manager has formally approved access in the system
- [ ] Ask a colleague if they have the same issue (might be system-wide)

> **⚠️ Most "Access" issues require IT action → ticket almost always required**  
> **✅ Self-resolvable only if:** VPN not connected, wrong credentials being used

---

### 📞 Phone / Microsoft Teams

**Sub-questions:**
1. **What is the issue?**  
   `[ Poor call quality ] [ Can't make calls ] [ Teams won't open ] [ Headset not working ] [ Teams crashing ] [ Not receiving calls ]`

2. **Which device?**  
   `[ Office desk phone ] [ Laptop (Teams) ] [ Mobile Teams app ] [ USB Headset ]`

**Self-Help Checklist:**
- [ ] Unplug and replug your headset
- [ ] Check Microphone/Speaker settings in Teams (Settings → Devices)
- [ ] Restart the Teams app
- [ ] Check if your microphone is muted (both hardware button and Teams)
- [ ] Test with another headset or built-in mic
- [ ] Restart your computer

> **✅ Resolvable:** Wrong audio device selected, headset unplugged  
> **❌ Not resolvable:** Teams account suspended, call routing issues → ticket

---

### 🖱️ Hardware / Peripherals

**Sub-questions:**
1. **What device is not working?**  
   `[ Mouse ] [ Keyboard ] [ Monitor ] [ Webcam ] [ USB Hub ] [ External Storage ] [ Docking Station ]`

2. **What is the symptom?**  
   `[ Not detected at all ] [ Works sometimes ] [ Wrong behaviour ] [ Physical damage ]`

**Self-Help Checklist:**
- [ ] Unplug and replug the device
- [ ] Try a different USB port
- [ ] Test the device on a different computer (to confirm if device is faulty)
- [ ] Update device drivers (Device Manager → Right click → Update driver)
- [ ] For wireless devices: change batteries

> **✅ Resolvable:** Most USB/port or driver issues  
> **❌ Not resolvable:** Physical damage, device not recognized on multiple PCs → ticket (hardware replacement)

---

### ❓ Other / General

**Sub-questions:**
1. **Describe the category in one line:**  
   `[ Free text ]`

2. **How urgent is this?**  
   `[ Blocking my work ] [ Can work around it ] [ No urgency ]`

> **No self-help checklist — goes directly to ticket form**

---

## Step 3 — Self-Help Gate (UI Logic)

```
if (category.selfResolvable === true) {
  Show: "Before we create a ticket, try these quick fixes:"
  
  → Display checklist with checkboxes
  
  if (user checks "✅ Problem is solved") {
    Show: 🎉 "Great! Glad it's fixed. No ticket needed."
    Action: Redirect to My Tickets dashboard
  }
  
  if (user checks "❌ Still not fixed") {
    Show: "No problem, we'll get an agent to help."
    Action: Proceed to Step 4 (ticket form, pre-filled)
  }
} else {
  // e.g. "Company-wide" scope or "Physical damage"
  Skip self-help → go straight to Step 4
  Set priority = CRITICAL or HIGH automatically
}
```

---

## Step 4 — Ticket Form (Pre-filled)

> At this point, the form fields are **automatically filled** from previous answers:

| Field | Auto-filled from |
|---|---|
| `Title` | Category label + sub-issue (e.g. "Printer Offline — Shared Office Printer") |
| `Category` | Step 1 selection |
| `Priority` | Derived from scope + symptom answers |
| `Description` | Structured summary of all sub-question answers |

Employee only needs to:
- Review and optionally edit the title/description
- Click **"Submit Ticket"**

---

## Priority Auto-Calculation Rules

| Condition | Priority |
|---|---|
| Scope: "Company-wide" or "Entire floor" | `critical` |
| Scope: "My whole team" | `high` |
| Scope: "Only me" + blocking work | `high` |
| Scope: "Only me" + can work around | `medium` |
| Access request (new, approved) | `low` |
| Hardware physical damage | `high` |
| BSOD / Won't power on | `critical` |

---

## Implementation Plan for `CreateTicket.jsx`

### Phase 1 — Update `constants.js`
- Replace old `CATEGORY` array with new `PROBLEM_TREE` object that includes:
  - `id`, `label`, `icon`, `description`
  - `subQuestions[]` (step 2 answers)
  - `selfHelpSteps[]` (step 3 checklist)
  - `selfResolvable: boolean`
  - `defaultPriority`
  - `escalateImmediatelyIf` (condition function/key)

### Phase 2 — Multi-Step Wizard UI
- **Step indicator** ("Step 1 of 4") at the top
- **Animated transitions** (`framer-motion` slide-in)
- Each step is a separate section rendered conditionally

### Phase 3 — Self-Help Card (Step 3)
- Animated checklist with checkbox items
- Two CTA buttons: `"✅ Problem Solved — No ticket needed"` and `"❌ Still not fixed — Create a ticket"`
- On "solved": show celebration state + redirect
- On "not fixed": slide to Step 4

### Phase 4 — Auto-fill & Submit (Step 4)
- Pre-populate `title` from category + sub-issue
- Pre-populate `description` as structured block with all answers
- Lock `priority` based on priority auto-calculation rules above
- Submit via existing `create()` hook

---

## Files to Create / Modify

| File | Change |
|---|---|
| `frontend/src/shared/utils/constants.js` | Replace `CATEGORY` + `CATEGORY_FOLLOWUP_QUESTIONS` with new `PROBLEM_TREE` |
| `frontend/src/views/employee/CreateTicket.jsx` | Full multi-step wizard rewrite |
| `frontend/src/components/employee/SelfHelpChecklist.jsx` | **(New)** Self-help gate component |
| `frontend/src/components/employee/ProblemCategoryCard.jsx` | **(New)** Category selector card |

---

*Last updated: 2026-03-27 | Status: Design spec — ready for implementation*
