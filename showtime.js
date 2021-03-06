const DOMMutationListener = _.throttle(updateTimeDivs, 200)
const observer = new MutationObserver(DOMMutationListener)
const startObservingDOM = () => observer.observe(document, { childList: true, subtree: true })
const stopObservingDOM = () => observer.disconnect()

startObservingDOM()

const TIME_DIV_CLASS = 'roam-plugin-showtime'
const METADATA_DIV_QUERY = 'div[data-edit-time]'

function updateTimeDivs() {
    // Disable listening for DOM mutations while we mutate the DOM.
    stopObservingDOM()
    removeOldTimeDivs()
    resetContainerPadding()
    const sidebarOpen = (document.querySelector("div#roam-right-sidebar-content") != null)
    const inCcCxMode = (document.querySelector(METADATA_DIV_QUERY) != null)
    // Only add timedivs when in C-c C-x mode
    if (inCcCxMode) {
        if (sidebarOpen) {
            // With the sidebar open, our timedivs would be cutoff. So we make
            // some room for them.
            setContainerPadding()
        }
        // Add a div to each roam block.
        addTimeDivs()
    }
    startObservingDOM()
}

function setContainerPadding() {
    const mainContainer = document.querySelector('div.roam-center>div')
    if (mainContainer != null) {
        mainContainer.style.paddingLeft = "calc((100% - 520px) / 2)"
    }
    const sideContainer = document.querySelector('div#roam-right-sidebar-content')
    if (sideContainer != null) {
        sideContainer.style.position = "relative"  // Make absolute timedivs move with scroll.
        sideContainer.style.paddingLeft = "7em"
    }
}

function resetContainerPadding() {
    const mainContainer = document.querySelector('div.roam-center>div')
    if (mainContainer != null) {
        mainContainer.style.paddingLeft = "calc((100% - 800px) / 2)"
    }
    const sideContainer = document.querySelector('div#roam-right-sidebar-content')
    if (sideContainer != null) {
        sideContainer.style.position = "static"
        sideContainer.style.paddingLeft = "0"
    }
}

function addTimeDivs() {
    const roamBlocks = document.getElementsByClassName('roam-block-container')
    Array.from(roamBlocks).forEach(block => {
        // Get block creation & last-edited times
        const metaDataDiv = block.querySelector('div[data-edit-time]')
        let createTime = extractTimeFrom(metaDataDiv, "data-create-time")
        const editTime = extractTimeFrom(metaDataDiv, "data-edit-time")
        // Sometimes, creation time is missing
        if (createTime == null) {
            createTime = editTime
        }
        // Make a human-readable time string
        const timeText = makeText(createTime, editTime)
        // Add text to a new div and style it.
        const timeDiv = document.createElement('div')
        timeDiv.setAttribute('class', TIME_DIV_CLASS)
        timeDiv.textContent = timeText
        style(timeDiv)
        position(timeDiv)
        // Add new div to Roam block container div.
        block.appendChild(timeDiv)
        // Bring collapse/expand arrows to front, above timedivs.
        const controlsDiv = block.querySelector("div.controls")
        controlsDiv.style.zIndex = 1
    })
}

function removeOldTimeDivs() {
    const oldTimeDivs = document.getElementsByClassName(TIME_DIV_CLASS)
    Array.from(oldTimeDivs).forEach(div => div.remove())
}

function extractTimeFrom(metaDataDiv, attributeName) {
    const timestamp = metaDataDiv.getAttribute(attributeName)
    if (timestamp == null) {
        return null
    } else {
        return new Date(parseInt(timestamp))
    }
}

function makeText(createTime, editTime) {
    let timeDivText
    const createTimeText = formatTime(createTime)
    const editTimeText = formatTime(editTime)
    let combinedTimeText
    if (createTimeText == editTimeText) {
        combinedTimeText = createTimeText
    } else {
        combinedTimeText = `${createTimeText} – ${editTimeText}`
    }
    if (isLessThan24HoursAgo(createTime) && isLessThan24HoursAgo(editTime)) {
        timeDivText = combinedTimeText
    } else {
        const createDateText = formatDate(createTime)
        const editDateText = formatDate(editTime)
        if (createDateText == editDateText) {
            timeDivText = `${createDateText}, ${combinedTimeText}`
        } else {
            timeDivText = `${createDateText}, ${createTimeText}\n`
                        + `${editDateText}, ${editTimeText}`
        }
    }
    return timeDivText
}

function isLessThan24HoursAgo(datetime) {
    now = new Date()
    interval = now - datetime  // in ms
    return (interval / 1000) < (24 * 3600)
}

const formatTime = (datetime) => datetime.toLocaleTimeString(
    navigator.language,
    { hour: "2-digit", minute: "2-digit" }
)

const formatDate = (datetime) => datetime.toLocaleDateString(
    navigator.language,
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
)

function style(div) {
    div.style.fontSize = "0.6em"
    div.style.backgroundColor = "#eee"
    div.style.borderRadius = "0.4em"
    div.style.padding = "0.1em 0.5em"  // vertical, horizontal
    div.style.whiteSpace = "pre"  // Keep linebreak in textContent.
}

function position(div) {
    div.style.position = "absolute"
    div.style.transform = "translateX(-100%)"
                        + "translateX(2.2em)"
                        + "translateY(0.7em)"
}
