# Responsive Design Testing Guide

## Quick Visual Test Checklist

### 1. Profile Components

#### UserProfilePopup
**Mobile (< 640px)**
- [ ] Opens as full-width bottom sheet
- [ ] Rounded top corners (3xl)
- [ ] Cover photo 24px height
- [ ] Avatar 24px size
- [ ] Stats in 2-column grid
- [ ] Smooth slide-up animation

**Tablet (640px - 767px)**
- [ ] Transitions to centered modal
- [ ] Cover photo 32px height
- [ ] Avatar 32px size
- [ ] Stats in 4-column grid

**Desktop (1024px+)**
- [ ] Fully centered modal
- [ ] Max width 672px (max-w-2xl)
- [ ] All touch targets easily clickable with mouse

**Test Actions:**
1. Click any user avatar
2. Resize browser from 320px to 1920px
3. Verify smooth transitions at breakpoints
4. Test edit mode on all sizes
5. Upload avatar on mobile

#### UserAvatar Component
**All Sizes**
- [ ] Small: 12px → 14px → 16px
- [ ] Medium: 16px → 18px → 20px
- [ ] Large: 20px → 22px → 24px
- [ ] XL: 24px → 28px → 32px
- [ ] Status indicator scales proportionally
- [ ] Clickable with clear hover/press states

### 2. Room Cards

#### ActiveRoomCard
**Mobile (< 768px)**
- [ ] Width: 260px
- [ ] Height: 180px
- [ ] Buttons 10px size (comfortable tap)
- [ ] Heart animation visible
- [ ] Horizontal scroll works smoothly

**Desktop (768px+)**
- [ ] Width: 280px
- [ ] Height: 200px
- [ ] Buttons 12px size
- [ ] Hover effects active
- [ ] Title text larger (lg)

**Test Actions:**
1. Scroll through active rooms horizontally
2. Tap/click favorite button (watch heart animation)
3. Click share button
4. Tap participant avatars to open profiles
5. Verify all touch targets ≥ 44px on mobile

#### LuxRoomCard
**Mobile (< 640px)**
- [ ] Height: 200px
- [ ] All badges visible (top-2)
- [ ] Action buttons have 1.5px gap
- [ ] Content padding 3px
- [ ] Press animation works

**Tablet (640px+)**
- [ ] Height: 220px
- [ ] Badges at top-3
- [ ] Button gap 2px
- [ ] Content padding 4px
- [ ] Title text lg

**Test Actions:**
1. Click room card to enter
2. Long-press to feel press animation
3. Check badge positioning
4. Verify gradient backgrounds

#### LuxRoomsGrid
**Mobile (< 640px)**
- [ ] 1 column layout
- [ ] 3px gap between cards

**Tablet (640px - 1023px)**
- [ ] 2 column layout
- [ ] 4px gap between cards

**Desktop (1024px+)**
- [ ] 3 column layout
- [ ] 6px gap between cards

**Test Actions:**
1. Filter rooms by country
2. Verify grid reflows at breakpoints
3. Check spacing consistency

### 3. Voice Chat Interface

#### VoiceChat Page
**Mobile (< 640px)**
- [ ] Title pill centered (50%)
- [ ] Title pill top-4
- [ ] Seating area -top-8
- [ ] Glass frame rounded-2xl
- [ ] Frame padding 4px
- [ ] Controls stick to bottom with safe area

**Tablet (640px+)**
- [ ] Title pill right-shifted (60%)
- [ ] Title pill top-6
- [ ] Seating area -top-12
- [ ] Glass frame rounded-3xl
- [ ] Frame padding 6px → 10px (md:)

**Test Actions:**
1. Join a voice room
2. Resize window through breakpoints
3. Check controls don't overlap with content
4. Verify safe area on iPhone X+
5. Test with keyboard open (mobile)

#### ComprehensiveControlBar
**Mobile (< 768px)**
- [ ] Padding 3px → 4px (sm:)
- [ ] All buttons 10px size
- [ ] Main mic 14px
- [ ] Icons 4px
- [ ] Leave button text hidden
- [ ] Touch-friendly spacing

**Desktop (768px+)**
- [ ] Padding 6px
- [ ] All buttons 12px
- [ ] Main mic 16px
- [ ] Icons 5px
- [ ] Leave button shows "Leave"
- [ ] Hover effects active

**Test Actions:**
1. Toggle mic on/off (watch ripple animation)
2. Adjust volume slider
3. Click all control buttons
4. Verify minimum 44px tap targets on mobile
5. Test keyboard shortcuts

#### ParticipantAvatar (Voice Room)
**Mobile**
- [ ] Avatars scale down appropriately
- [ ] Speaking ring visible
- [ ] Mute indicator clear
- [ ] Names don't overflow

**Desktop**
- [ ] Avatars larger, easier to see
- [ ] Hover effects work
- [ ] Click to view profile

**Test Actions:**
1. Join room with 8 participants
2. Watch speaking indicators
3. Click each avatar
4. Verify circular layout on all sizes

#### ParticipantPanel
**Mobile (< 640px)**
- [ ] Full-width panel
- [ ] Header padding 4px
- [ ] List padding 3px
- [ ] Smooth slide-in from right

**Tablet (640px+)**
- [ ] Fixed width (384px / w-96)
- [ ] Header padding 6px
- [ ] List padding 4px
- [ ] Doesn't cover main content

**Test Actions:**
1. Open participants list
2. Scroll through long lists
3. Close with X or backdrop click
4. Verify smooth animations

### 4. Navigation

#### TopNavigation
**Mobile (< 768px)**
- [ ] Compact layout
- [ ] Search bar 9px height
- [ ] Logo 8px size
- [ ] Notification badge 4px
- [ ] User avatar small
- [ ] All touch targets ≥ 44px

**Desktop (768px+)**
- [ ] Expanded layout
- [ ] Search bar 10px height
- [ ] Logo 10px size
- [ ] Notification badge 5px
- [ ] Filter buttons with scale effect
- [ ] Hover states on all buttons

**Test Actions:**
1. Search for rooms
2. Click notification bell
3. Click user avatar
4. Use filter buttons
5. Test dropdown menus

#### RoomNotification (Toast)
**Mobile (< 640px)**
- [ ] Gap 2px
- [ ] Padding 3px
- [ ] Avatar 8px
- [ ] Slide-in from right

**Tablet (640px+)**
- [ ] Gap 3px
- [ ] Padding 4px
- [ ] Avatar 10px
- [ ] Auto-dismiss after 4s

**Test Actions:**
1. Join/leave room multiple times
2. Watch notification animations
3. Dismiss manually
4. Check positioning on different sizes

### 5. Chat Components

#### ChatOverlay
**All Sizes**
- [ ] Messages don't overlap controls
- [ ] Text readable (xs → sm)
- [ ] Spacing 1.5px → 2px (sm:)
- [ ] Auto-scroll to new messages
- [ ] Timestamps visible

**Test Actions:**
1. Send multiple messages
2. Verify auto-scroll
3. Check text wrapping on narrow screens
4. Test with long messages

#### VoiceChatInputBar
**Mobile (< 640px)**
- [ ] Padding 3px
- [ ] Input takes full width
- [ ] Send button accessible
- [ ] Keyboard doesn't cover input

**Tablet (640px+)**
- [ ] Padding 4px
- [ ] More breathing room
- [ ] Enter key works

**Test Actions:**
1. Type message on mobile keyboard
2. Send with enter key
3. Send with button
4. Verify emoji button works

## Performance Testing

### Load Times
- [ ] Initial page load < 3s (3G)
- [ ] Route transitions < 500ms
- [ ] Image loading doesn't block UI
- [ ] Animations smooth (60fps)

### Memory
- [ ] No memory leaks on route changes
- [ ] Audio streams cleaned up on room leave
- [ ] No console errors

### Network
- [ ] Works on slow 3G
- [ ] Graceful degradation on offline
- [ ] Real-time updates work

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dialogs
- [ ] Focus indicators visible

### Touch Targets (Mobile)
- [ ] All buttons ≥ 44x44px
- [ ] Spacing between targets ≥ 8px
- [ ] No accidental taps

### Screen Readers
- [ ] ARIA labels present
- [ ] Roles correct
- [ ] Live regions for notifications
- [ ] Alt text on images

## Cross-Browser Testing

### Chrome/Edge (Chromium)
- [ ] Mobile viewport (DevTools)
- [ ] Tablet viewport
- [ ] Desktop
- [ ] Touch events work

### Safari
- [ ] iOS Safari (real device preferred)
- [ ] macOS Safari
- [ ] Safe area insets work (iPhone X+)
- [ ] Webkit prefixes applied

### Firefox
- [ ] Desktop
- [ ] Mobile (if available)
- [ ] Grid layouts work
- [ ] Animations smooth

### Samsung Internet
- [ ] Real Android device
- [ ] Touch interactions
- [ ] PWA features (if applicable)

## Device Testing Matrix

### Priority Devices
| Device | Screen | Resolution | Test Priority |
|--------|--------|------------|---------------|
| iPhone SE | 4.7" | 375x667 | High |
| iPhone 12/13 | 6.1" | 390x844 | High |
| iPhone 14 Pro Max | 6.7" | 430x932 | Medium |
| iPad Air | 10.9" | 820x1180 | High |
| Galaxy S21 | 6.2" | 360x800 | High |
| Galaxy Tab | 10.4" | 610x960 | Medium |
| Desktop 1080p | 15-24" | 1920x1080 | High |
| Desktop 1440p | 27" | 2560x1440 | Medium |

## Regression Testing

### After Code Changes
1. [ ] Profile popup still responsive
2. [ ] Room cards render correctly
3. [ ] Voice controls work on all sizes
4. [ ] Navigation adapts properly
5. [ ] No layout shifts
6. [ ] Animations still smooth
7. [ ] No new console errors
8. [ ] TypeScript compiles
9. [ ] ESLint passes

## Known Issues & Workarounds

### CSS Inline Style Warnings
- **Issue**: Dynamic background images trigger linter warnings
- **Status**: Non-critical, acceptable for dynamic content
- **Workaround**: None needed

### Scrollbar Width
- **Issue**: `scrollbar-width: none` not supported in old Safari
- **Status**: Graceful degradation (scrollbar shows)
- **Workaround**: `-webkit-scrollbar` fallback in globals.css

### Safe Area Insets
- **Issue**: Only works on iOS 11+ with notch
- **Status**: Progressive enhancement
- **Workaround**: Falls back to 1rem padding

## Test Report Template

```markdown
## Test Date: [DATE]
**Tester**: [NAME]
**Build**: [VERSION/COMMIT]

### Devices Tested
- [ ] iPhone [MODEL] - iOS [VERSION]
- [ ] Android [MODEL] - [VERSION]
- [ ] iPad [MODEL] - iPadOS [VERSION]
- [ ] Desktop - [BROWSER] [VERSION]

### Results
- Profile Components: ✅ Pass / ❌ Fail
- Room Cards: ✅ Pass / ❌ Fail
- Voice Chat: ✅ Pass / ❌ Fail
- Navigation: ✅ Pass / ❌ Fail
- Chat: ✅ Pass / ❌ Fail

### Issues Found
1. [Description] - [Severity: Low/Medium/High]
2. [Description] - [Severity: Low/Medium/High]

### Screenshots
[Attach screenshots of any issues]

### Notes
[Additional observations]
```

## Automated Testing (Future)

### Cypress/Playwright Tests
```javascript
describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(({ name, width, height }) => {
    it(`should display correctly on ${name}`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      // Add assertions
    });
  });
});
```

### Visual Regression Tests
- Percy, Chromatic, or similar
- Capture screenshots at each breakpoint
- Compare against baseline
- Flag any visual changes

## Approval Criteria

Before marking responsive design as complete:
- [ ] All priority devices tested
- [ ] No critical accessibility issues
- [ ] Performance metrics met
- [ ] Cross-browser compatibility verified
- [ ] User feedback collected (if applicable)
- [ ] Documentation updated
- [ ] QA sign-off obtained
