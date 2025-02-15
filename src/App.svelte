<script>
  import "@fortawesome/fontawesome-free/css/fontawesome.css"
  import "@fortawesome/fontawesome-free/css/solid.css"

  import {onMount} from "svelte"
  import {writable} from "svelte/store"
  import {fly, fade} from "svelte/transition"
  import {cubicInOut} from "svelte/easing"
  import {throttle} from 'throttle-debounce'
  import {Router, Route, links, navigate} from "svelte-routing"
  import {globalHistory} from "svelte-routing/src/history"
  import {hasParent} from 'src/util/html'
  import {timedelta} from 'src/util/misc'
  import {store as toast} from "src/state/toast"
  import {channels, epoch} from "src/state/nostr"
  import {modal, logout, alerts} from "src/state/app"
  import {user} from 'src/state/user'
  import Anchor from 'src/partials/Anchor.svelte'
  import NoteDetail from "src/partials/NoteDetail.svelte"
  import NotFound from "src/routes/NotFound.svelte"
  import Search from "src/routes/Search.svelte"
  import Alerts from "src/routes/Alerts.svelte"
  import Notes from "src/routes/Notes.svelte"
  import Login from "src/routes/Login.svelte"
  import Profile from "src/routes/Profile.svelte"
  import Settings from "src/routes/Settings.svelte"
  import Keys from "src/routes/Keys.svelte"
  import RelayList from "src/routes/RelayList.svelte"
  import AddRelay from "src/routes/AddRelay.svelte"
  import UserDetail from "src/routes/UserDetail.svelte"
  import UserAdvanced from "src/routes/UserAdvanced.svelte"
  import NoteCreate from "src/routes/NoteCreate.svelte"
  import Chat from "src/routes/Chat.svelte"
  import ChatRoom from "src/routes/ChatRoom.svelte"
  import ChatEdit from "src/routes/ChatEdit.svelte"

  const menuIsOpen = writable(false)
  const toggleMenu = () => menuIsOpen.update(x => !x)

  const searchIsOpen = writable(false)
  const toggleSearch = () => searchIsOpen.update(x => !x)

  let menuIcon
  let scrollY
  let suspendedSubs = []
  let mostRecentAlert = epoch

  export let url = ""

  // Close menu on click outside
  document.querySelector("html").addEventListener("click", e => {
    if (e.target !== menuIcon) {
      menuIsOpen.set(false)
    }
  })

  onMount(() => {
    // Poll for new notifications
    (async function pollForNotifications() {
      if ($user) {
        const events = await channels.getter.all({
          kinds: [1, 7],
          '#p': $user.pubkey,
          since: $alerts.since,
        })

        mostRecentAlert = events.reduce((t, e) => Math.max(t, e.created_at), $alerts.since)
      }

      setTimeout(pollForNotifications, 60_000)
    })()

    return modal.subscribe($modal => {
      // Keep scroll position on body, but don't allow scrolling
      if ($modal) {
        // This is not idempotent, so don't duplicate it
        if (document.body.style.position !== 'fixed') {
          scrollY = window.scrollY

          document.body.style.top = `-${scrollY}px`
          document.body.style.position = `fixed`
        }
      } else {
        document.body.style = ''
        window.scrollTo(0, scrollY)
      }
    })
  })
</script>

<svelte:body on:keydown={e => e.key === 'Escape' && modal.set(null)} />

<Router {url}>
  <div use:links class="h-full">
    <div class="pt-16 text-white h-full">
      <Route path="/alerts" component={Alerts} />
      <Route path="/search/:type" let:params>
        {#key params.type}
        <Search {...params} />
        {/key}
      </Route>
      <Route path="/notes/:activeTab" component={Notes} />
      <Route path="/notes/new" component={NoteCreate} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat/new" component={ChatEdit} />
      <Route path="/chat/:room" let:params>
        {#key params.room}
        <ChatRoom {...params} />
        {/key}
      </Route>
      <Route path="/chat/:room/edit" component={ChatEdit} />
      <Route path="/users/:pubkey/:activeTab" let:params>
        {#key params.pubkey + params.activeTab}
        <UserDetail {...params} />
        {/key}
      </Route>
      <Route path="/keys" component={Keys} />
      <Route path="/relays" component={RelayList} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={Login} />
      <Route path="*" component={NotFound} />
    </div>

    <ul
      class="py-20 w-56 bg-dark fixed top-0 bottom-0 left-0 transition-all shadow-xl
             border-r border-medium text-white overflow-hidden z-10"
      class:-ml-56={!$menuIsOpen}
    >
      {#if $user}
      <li>
        <a href={`/users/${$user.pubkey}/notes`} class="flex gap-2 px-4 py-2 pb-6 items-center">
          <div
            class="overflow-hidden w-6 h-6 rounded-full bg-cover bg-center shrink-0 border border-solid border-white"
            style="background-image: url({$user.picture})" />
          <span class="text-lg font-bold">{$user.name}</span>
        </a>
      </li>
      <li class="cursor-pointer relative">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/alerts">
          <i class="fa-solid fa-bell mr-2" /> Alerts
          {#if mostRecentAlert > $alerts.since}
          <div class="w-2 h-2 rounded bg-accent absolute top-3 left-6" />
          {/if}
        </a>
      </li>
      {/if}
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/search/people">
          <i class="fa-solid fa-search mr-2" /> Search
        </a>
      </li>
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/notes/global">
          <i class="fa-solid fa-tag mr-2" /> Notes
        </a>
      </li>
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/chat">
          <i class="fa-solid fa-message mr-2" /> Chat
        </a>
      </li>
      <li class="h-px mx-3 my-4 bg-medium" />
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/relays">
          <i class="fa-solid fa-server mr-2" /> Relays
        </a>
      </li>
      {#if $user}
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/keys">
          <i class="fa-solid fa-key mr-2" /> Keys
        </a>
      </li>
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/settings">
          <i class="fa-solid fa-gear mr-2" /> Settings
        </a>
      </li>
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" on:click={logout}>
          <i class="fa-solid fa-right-from-bracket mr-2" /> Logout
        </a>
      </li>
      {:else}
      <li class="cursor-pointer">
        <a class="block px-4 py-2 hover:bg-accent transition-all" href="/login">
          <i class="fa-solid fa-right-to-bracket mr-2" /> Login
        </a>
      </li>
      {/if}
    </ul>

    <div
      class="fixed top-0 bg-dark flex justify-between items-center text-white w-full p-4
                border-b border-medium z-10"
    >
      <i class="fa-solid fa-bars fa-2xl cursor-pointer" bind:this={menuIcon} on:click={toggleMenu} />
      <Anchor external type="unstyled" href="https://github.com/staab/coracle">
        <h1 class="staatliches text-3xl">Coracle</h1>
      </Anchor>
      {#if mostRecentAlert > $alerts.since}
      <div class="w-2 h-2 rounded bg-accent absolute top-4 left-12" />
      {/if}
    </div>

    {#if $modal}
    <div class="fixed inset-0 z-10">
      <div
        class="absolute inset-0 opacity-75 bg-black cursor-pointer"
        transition:fade
        on:click={e => modal.set(null)} />
      <div class="absolute inset-0 mt-20 sm:mt-32 modal-content" transition:fly={{y: 1000, opacity: 1}}>
        <dialog open class="bg-dark border-t border-solid border-medium h-full w-full overflow-auto">
          {#if $modal.note}
            {#key $modal.note.id}
            <NoteDetail note={$modal.note} />
            {/key}
          {:else if $modal.form === 'relay'}
            <AddRelay />
          {:else if $modal.form === 'user/advanced'}
            <UserAdvanced />
          {/if}
        </dialog>
      </div>
    </div>
    {/if}

    {#if $toast}
      <div
        class="fixed top-0 left-0 right-0 pointer-events-none z-10"
        transition:fly={{y: -50, duration: 300}}
      >
        <div
          class="rounded bg-accent shadow-xl mx-24 sm:mx-32 mt-2 p-3 text-white text-center border border-dark"
        >
          {$toast.message}
        </div>
      </div>
    {/if}
  </div>
</Router>
