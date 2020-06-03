const DOMMutationListener = _.throttle(showTime, 200)
const observer = new MutationObserver(DOMMutationListener)
const startObservingDOM = () => observer.observe(document, { childList: true, subtree: true })
const stopObservingDOM = () => observer.disconnect()

startObservingDOM()

function showTime() {
    stopObservingDOM()
    const infoDivs = document.querySelectorAll("div[data-edit-time]")
    Array.from(infoDivs).forEach(div => {
        // Remove prior styling
        div.classList = []
        div.style.backgroundImage = null
        // Get created & last-edited times
        const createTime = extractTimeFrom(div, "data-create-time")
        const editTime = extractTimeFrom(div, "data-edit-time")
        if (createTime == editTime) {
            div.textContent = createTime
        } else {
            div.textContent = `${createTime}\n${editTime}`
        }
        style(div)
    })
    startObservingDOM()
}

function extractTimeFrom(div, attributeName) {
    const timestamp = div.getAttribute(attributeName)
    if (timestamp == null) {
        return "/"
    } else {
        const datetime = new Date(parseInt(timestamp))
        if (_24hoursHavePassedSince(datetime)) {
            format = { 
                weekday: "short", month: "short", day: "numeric", 
                year: "numeric", hour: "2-digit", minute: "2-digit" 
            }
        } else {
            format = { hour: "2-digit", minute: "2-digit" }
        }
        return datetime.toLocaleTimeString(navigator.language, format)
    }
}

function _24hoursHavePassedSince(datetime) {
    now = new Date()
    interval = now - datetime  // in ms
    return (interval / 1000) > (24 * 3600)
}

function style(div) {
    div.style.fontSize = "0.6em"
    div.style.backgroundColor = "#eee"
    div.style.borderRadius = "0.4em"
    div.style.paddingRight = "0.5em"
    div.style.paddingLeft = "0.5em"
    div.style.paddingTop = "0.2em"
    div.style.paddingBottom = "0.2em"
    div.style.marginRight = "0.4em"
    div.style.whiteSpace = "pre"  // Keep linebreak in our textContent.
}
