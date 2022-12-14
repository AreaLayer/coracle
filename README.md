Bugs

- [ ] Support bech32 keys
- [ ] Loading icon not showing at bottom
- [ ] uniq and sortBy are sprinkled all over the place, figure out a better solution
- [ ] With link/image previews, remove the url from the note body if it's on a separate last line
- [ ] Search page is slow and likes don't show up. Probably move this server-side
- [ ] Replies counts aren't showing on replies

Features

- [x] Chat
- [x] Threads/social
- [x] Search
- [ ] Mentions
- [x] Link previews
- [x] Add notes, follows, likes tab to profile
- [ ] Notifications
- [ ] Images
- [ ] Server discovery and relay publishing - https://github.com/nostr-protocol/nips/pull/32/files
- [ ] Favorite chat rooms
- [ ] Optimistically load events the user publishes (e.g. to reduce reflow for reactions/replies).
  - Essentially, we can pretend to be our own in-memory relay.
  - This allows us to keep a copy of all user data, and possibly user likes/reply parents

Nostr implementation comments

- [ ] It's impossible to get deletes for an event's replies/mentions in one query, since deletes can't tag anything other than what is to be deleted.
- [ ] Recursive queries are really painful, e.g. to get all notes for an account, you need to 1. get the account's notes, then get everything with those notes in their tags, then get deletions for those.
- [ ] The limit of 3 channels makes things difficult. I want to show a modal without losing all the state in the background. I am reserving one channel for one-off recursive queries.
- [ ] Why no spaces in names? Seems user hostile
