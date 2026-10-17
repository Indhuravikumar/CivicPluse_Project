# CivicPulse — AGENTS.md

## Project Identity

CivicPulse is a crowdsourced civic issue reporting and resolution platform.

The platform allows citizens to:

- Report civic issues
- Provide issue descriptions and evidence
- Select or provide issue locations
- Track issue progress
- Discover issues reported around the city
- View issue locations on a map
- Understand department responsibility
- Track their own reports
- Receive meaningful status updates
- View civic activity and insights

The product should feel like a serious, production-quality civic platform.

It should be modern and somewhat futuristic through functionality and thoughtful UX, NOT through visual gimmicks.

---

# 1. PRIMARY DESIGN PRINCIPLE

## CivicPulse must look HUMAN-MADE.

The finished application must not look like it was generated from a generic AI dashboard template.

Every UI decision should feel intentional.

Prefer:

- Clear hierarchy
- Realistic product behavior
- Thoughtful spacing
- Natural content
- Strong typography
- Consistent interaction patterns
- Practical layouts
- Subtle visual details
- Meaningful empty states
- Real loading and error states
- Natural micro-interactions
- Maintainable components

Avoid:

- Generic AI dashboard layouts
- Repetitive cards
- Excessive rounded containers
- Excessive gradients
- Neon effects
- Excessive glow
- Glassmorphism everywhere
- Decorative AI sparkles
- Unnecessary animations
- Huge statistics
- Fake charts
- Fake activity
- Fake AI insights
- Excessive badges
- Excessive pills
- Overly complex components
- Unnecessary visual decoration

The application should feel like an experienced product designer and frontend developer intentionally built it.

---

# 2. DO NOT OVERDESIGN

Premium does NOT mean adding more UI.

Premium means:

- Better hierarchy
- Better spacing
- Better typography
- Better interaction
- Better information architecture
- Better states
- Better consistency

Do not add UI simply because there is empty space.

Whitespace is allowed.

A page does not need to be filled with cards, charts, illustrations, or widgets.

---

# 3. PRODUCT DESIGN PHILOSOPHY

CivicPulse should feel:

- Trustworthy
- Civic
- Modern
- Calm
- Useful
- Professional
- Human
- Slightly futuristic
- Accessible

It should NOT feel:

- Corporate-governmental
- Generic SaaS
- AI-generated
- Gaming-oriented
- Overly futuristic
- Experimental
- Visually noisy

---

# 4. EXISTING DESIGN MUST BE RESPECTED

Before modifying an existing page or component:

1. Inspect the existing implementation.
2. Understand why it exists.
3. Check how it is used elsewhere.
4. Reuse existing components where possible.
5. Preserve existing functionality.
6. Modify only what is necessary.

Do not replace an existing implementation just because another approach is more fashionable.

Do not rewrite working code without a clear reason.

---

# 5. PAGE DEVELOPMENT ORDER

The current intended frontend development order is:

1. Application Shell
2. Dashboard
3. Report Issue
4. Issues
5. Issue Details
6. Live Map
7. Departments
8. Department Details
9. My Reports
10. Profile
11. Notifications
12. Global Search
13. Civic Insights / Analytics
14. Settings
15. Global states and UX polish
16. Final responsive and theme refinement

Do not automatically jump to another page after completing a page.

Only work on the page requested by the user.

---

# 6. CURRENT CORE USER FLOW

The primary citizen journey is:

Dashboard
↓
Report Issue
↓
Submit Issue
↓
Issue Details
↓
Track Progress
↓
Resolution

The discovery flow is:

Dashboard
↓
Issues
↓
Issue Details
↓
Live Map

The citizen ownership flow is:

Report Issue
↓
My Reports
↓
Report Tracking

Always preserve these relationships.

---

# 7. DO NOT BREAK EXISTING FUNCTIONALITY

When modifying frontend UI:

DO NOT accidentally break:

- Routing
- Authentication
- API requests
- Issue creation
- Issue retrieval
- Issue status
- Location handling
- Map functionality
- Image uploads
- Theme switching
- Search
- Filters
- Existing form validation
- Existing state management

Before changing a shared component, check where it is used.

---

# 8. REAL DATA ONLY

Never fabricate production-looking data.

Do not invent:

- Issue titles
- Locations
- Departments
- Report IDs
- User counts
- Issue counts
- Status history
- Timestamps
- Resolution rates
- AI confidence
- Response times
- Department statistics
- Map locations
- Images
- Activity logs

If real data is unavailable, use the appropriate:

- Empty state
- Loading state
- Not available state
- Error state

Do not make an empty application look artificially populated.

---

# 9. AI FUNCTIONALITY

CivicPulse may contain AI-assisted functionality.

AI functionality must be truthful.

Do not claim that a feature uses AI unless the project actually implements it.

Do not create fake:

- AI confidence scores
- AI recommendations
- AI predictions
- AI-generated classifications
- AI insights

If AI functionality is simulated for a prototype, clearly keep it within the project's intended prototype behavior.

Never present mocked AI behavior as a real production capability.

---

# 10. LIGHT AND DARK THEMES

Both themes are first-class experiences.

Never design only for dark mode and then simply invert the colors for light mode.

Light mode must be intentionally designed.

Dark mode must be intentionally designed.

Both must have:

- Good contrast
- Surface hierarchy
- Clear borders
- Proper hover states
- Proper focus states
- Readable secondary text
- Correct semantic colors
- Good disabled states
- Good empty states
- Good loading states

The application should never feel:

"premium in dark mode and unfinished in light mode."

---

# 11. COLOR SYSTEM

Use the existing CivicPulse color system.

Primary interaction color:

- CivicPulse blue

Use semantic colors carefully:

- Success → green
- Warning → amber/yellow
- Error/critical → red
- Informational → blue

Do not introduce random colors for decorative purposes.

Do not use neon green as a primary UI accent.

Do not turn every component into a colorful component.

Color should communicate meaning.

---

# 12. PREMIUM VISUAL LANGUAGE

Prefer:

- Moderate border radius
- Subtle borders
- Restrained shadows
- Clear typography
- Consistent spacing
- Clean iconography
- Subtle hover states
- Controlled elevation
- Strong alignment

Avoid:

- Heavy shadows
- Giant rounded cards
- Excessive gradients
- Glowing borders
- Neon backgrounds
- Excessive glass effects
- Decorative blobs
- Unnecessary illustrations
- Floating elements without purpose

---

# 13. COMPONENT DESIGN

Components should be reusable where reuse is meaningful.

Prefer components such as:

- Button
- Input
- Select
- Modal
- StatusBadge
- IssueCard
- IssueTimeline
- EmptyState
- LoadingState
- ErrorState
- MapView
- ImageGallery

Do not create a component for every tiny HTML fragment.

Do not over-abstract simple UI.

A component should exist because it:

- Is reused
- Has meaningful behavior
- Has meaningful styling
- Improves maintainability
- Represents a real product concept

---

# 14. COMPONENT CONSISTENCY

If the same concept appears in multiple pages, reuse the same visual language.

For example:

Issue status should not look completely different on:

- Dashboard
- Issues
- Issue Details
- My Reports

The exact layout can differ, but the semantic visual language should remain consistent.

---

# 15. BUTTON BEHAVIOR

Buttons must behave predictably.

A selectable/toggleable control must support both:

SELECT

and

DESELECT

Example:

Initial:

[ Option ]

After click:

[✓ Option]

After clicking again:

[ Option ]

Do not create one-way selection behavior unless the product explicitly requires a mandatory selection.

For mandatory single-selection controls, preserve the required selection.

---

# 16. ISSUE STATUS IS READ-ONLY FOR CITIZENS

Citizen-facing pages must not allow citizens to manually change:

- Pending
- Under Review
- Assigned
- In Progress
- Resolved
- Rejected

Issue status is controlled by the backend/workflow.

Do not turn status displays into toggle buttons.

---

# 17. FORMS

Forms should feel practical and human.

Avoid:

- Excessively long forms
- Unnecessary fields
- Giant input boxes
- Excessive helper text
- Excessive validation messages

Use:

- Clear labels
- Useful placeholders
- Sensible validation
- Logical grouping
- Progressive disclosure where appropriate

---

# 18. VALIDATION

Do not show every validation error immediately.

Prefer validation when:

- The user leaves a field
- The user attempts to continue
- The user submits

Error messages should be:

- Short
- Human-readable
- Specific
- Actionable

Avoid technical errors such as:

"ValidationError: field is invalid."

Prefer:

"Please select a location."

---

# 19. LOADING STATES

Every data-dependent page should have a proper loading state.

Prefer skeletons that resemble the final content.

Avoid:

- Giant spinners
- Blank pages
- Layout jumps

Loading states should preserve the page structure.

---

# 20. EMPTY STATES

Empty states are part of the product.

An empty state should explain:

1. What is empty
2. Why it may be empty
3. What the user can do next

Example:

"No reports yet.

Report a civic issue and track its progress here.

[ Report an issue ]"

Do not fill empty states with fake content.

---

# 21. ERROR STATES

API failures must not leave blank screens.

Provide a useful message and recovery action.

Example:

"Couldn't load issues.

Something went wrong while loading civic reports.

[ Try again ]"

Do not expose raw technical errors to users.

---

# 22. RESPONSIVE DESIGN

The application must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink desktop layouts.

Mobile layouts should be intentionally designed.

Important:

- Navigation should remain usable.
- Buttons should remain accessible.
- Tables should adapt.
- Cards should become appropriate layouts.
- Maps should remain usable.
- Forms should remain comfortable.
- Timeline alignment must remain stable.

---

# 23. ACCESSIBILITY

Follow basic accessibility practices.

Use:

- Semantic HTML
- Accessible labels
- Keyboard navigation
- Visible focus states
- Proper button semantics
- Proper form labels
- Appropriate aria attributes
- Sufficient contrast
- Accessible images

Do not communicate important information through color alone.

---

# 24. ANIMATIONS

Animations should communicate state or improve interaction.

Good uses:

- Page transitions
- Button feedback
- Loading
- Modal opening
- Dropdown transitions
- Hover feedback
- Success feedback

Avoid:

- Constant moving elements
- Animated backgrounds
- Excessive bouncing
- Decorative animations
- Slow transitions
- Animation on every component

Animations should be subtle and fast.

---

# 25. ICONS

Use the project's existing icon library.

Do not mix multiple unrelated icon styles.

Icons should support understanding.

Do not add icons simply to decorate every label.

---

# 26. MAPS

Reuse the existing map infrastructure.

Do not create multiple competing map implementations.

Map behavior must remain consistent between:

- Report Issue
- Issue Details
- Live Map
- Dashboard map previews

---

# 27. ROUTING

Follow the existing routing structure.

Do not introduce another routing pattern.

Before creating a route:

1. Check existing routes.
2. Check navigation.
3. Check links from other pages.
4. Reuse existing route conventions.

---

# 28. STATE MANAGEMENT

Use the project's existing state management approach.

Do not introduce a new state-management library just to solve a small problem.

Prefer local state for local UI.

Use shared state only when genuinely shared.

---

# 29. API / DATA FETCHING

Reuse existing API services and hooks.

Do not duplicate API calls in multiple components.

Do not put large API/data-processing implementations inside presentation components.

Keep:

UI
↓
Hooks / state
↓
Services
↓
API

where the existing architecture supports it.

---

# 30. TYPES

Use the existing TypeScript types.

Do not duplicate types unnecessarily.

If the backend schema already defines an Issue type, reuse it.

Do not create:

IssueData
IssueInfo
IssueDetailsData
IssueRecord

for the same underlying object unless there is a real architectural reason.

---

# 31. IMPORTANT FILE EDIT PERMISSIONS

The coding agent does NOT need to ask for permission before every normal file edit.

Normal development edits are automatically allowed.

The agent may freely edit normal project files required to complete the user's requested task.

Examples:

- React components
- Pages
- Hooks
- Utility files
- CSS
- Tailwind classes
- TypeScript files
- Local UI configuration
- Tests
- Non-sensitive assets

DO NOT repeatedly ask:

"Can I edit this file?"

for ordinary development work.

---

# 32. WHEN PERMISSION IS REQUIRED

Ask the user for confirmation ONLY when the requested change involves an important, sensitive, destructive, or potentially irreversible file/action.

Examples include:

### Environment / secrets

- `.env`
- `.env.production`
- API keys
- Tokens
- Credentials
- Secrets
- Private certificates

Never expose secret values.

---

### Dependency changes

Ask before:

- Removing major dependencies
- Replacing a core framework/library
- Performing a major dependency migration
- Changing package manager
- Making broad dependency upgrades that may break the project

Routine installation of a clearly required dependency may be performed when appropriate, but major dependency changes require confirmation.

---

### Destructive operations

Ask before:

- Deleting major project directories
- Deleting large numbers of files
- Replacing the entire project
- Resetting the repository
- Removing working functionality
- Running destructive database commands
- Deleting database data
- Dropping tables
- Resetting production-like data

---

### Important configuration

Ask before making major changes to:

- `package.json`
- Build configuration
- Deployment configuration
- Authentication configuration
- Database configuration
- Routing architecture
- Environment configuration
- CI/CD configuration
- Docker configuration if introduced later
- Security configuration

Small, clearly necessary edits to configuration files may be performed when they are directly required by the requested task.

Ask when the change is broad, risky, or potentially breaking.

---

# 33. FILE ACCESS PERMISSION RULE

Do NOT interpret normal file editing as requiring user permission.

The user has already authorized normal development work within the project.

Only ask for permission when:

1. The file contains secrets or credentials.
2. The change is destructive.
3. The change can significantly alter the project's architecture.
4. The change can cause data loss.
5. The change affects production/deployment/security.
6. The change removes important existing functionality.
7. The change is outside the scope of the user's requested task and has meaningful consequences.

Otherwise:

EDIT THE FILE AND CONTINUE.

Do not interrupt the workflow with unnecessary permission requests.

---

# 34. DO NOT ASK FOR PERMISSION FOR THESE

Unless the user explicitly restricts them, do NOT ask permission for ordinary edits to:

- `.tsx`
- `.ts`
- `.jsx`
- `.js`
- `.css`
- `.scss`
- Tailwind configuration for normal styling
- UI components
- Page components
- Hooks
- Utility functions
- Test files
- Local constants
- UI types
- Non-sensitive assets

The purpose of the agent is to implement the requested work efficiently.

---

# 35. BEFORE EDITING

For a normal requested UI task:

1. Inspect the relevant files.
2. Identify the existing implementation.
3. Identify reusable components.
4. Check related types/hooks/services.
5. Make the necessary changes.
6. Run appropriate checks.
7. Report what changed.

Do not ask for permission between every step.

---

# 36. BEFORE LARGE CHANGES

If a change could significantly affect architecture:

Explain briefly:

- What needs to change
- Why it needs to change
- Which important files are affected
- What could potentially break

Then ask for confirmation.

Do not ask permission merely because multiple files need editing.

The number of files is NOT the reason to ask.

The risk of the change is the reason.

---

# 37. DO NOT REWRITE THE PROJECT

Never:

- Delete the existing application
- Recreate the project from scratch
- Replace the entire frontend
- Replace working architecture
- Introduce a new stack unnecessarily

The goal is to improve the existing CivicPulse project.

---

# 38. DO NOT USE PLACEHOLDER UI IN FINAL IMPLEMENTATION

Avoid leaving:

- Lorem ipsum
- "Coming soon"
- Fake charts
- Fake statistics
- Placeholder names
- Random sample reports
- Random fake locations

unless the user explicitly asks for mock/demo data.

If a feature is not implemented yet, use a meaningful empty state.

---

# 39. PROTOTYPE DATA

If the project intentionally uses mock data for a prototype:

- Keep mock data clearly isolated.
- Do not mix mock data into production services.
- Make the structure easy to replace with real API data later.
- Keep realistic values.
- Do not make mock data misleading.

---

# 40. CODE QUALITY

Write code that another developer can understand.

Prefer:

- Clear names
- Small focused components
- Simple logic
- Reusable utilities
- Type safety
- Predictable state
- Minimal duplication

Avoid:

- Clever one-liners that reduce readability
- Giant components
- Deeply nested conditional rendering
- Unnecessary abstractions
- Duplicate logic
- Hardcoded magic values
- Temporary hacks

---

# 41. COMMENTS

Do not comment every line.

Comments should explain:

- Why something is unusual
- Why a workaround exists
- Important business rules
- Non-obvious technical decisions

Avoid comments that merely restate the code.

Bad:

```ts
// Set loading to true
setLoading(true);

// Prevent duplicate submissions while the report is being created.
Good: setIsSubmitting(true);
```
