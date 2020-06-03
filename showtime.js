const DOMMutationListener = _.throttle(showTime, 200)
const observer = new MutationObserver(DOMMutationListener)
observer.observe(document, { childList: true, subtree: true })

function showTime() {
    const infoDivs = document.querySelectorAll("div[data-edit-time]")
    Array.from(infoDivs).forEach(div => {
        // Remove prior styling
        div.classList = []
        div.style.backgroundImage = null
        // Get created & last-edited times
        function timestampToTime(attributeName) {
            const ts = div.getAttribute(attributeName)
            const d = new Date(parseInt(ts))
            // This will be in browser locale's timezone
            return d.toLocaleTimeString(navigator.language, 
                {hour:"2-digit", minute:"2-digit"})
        }
        const createTime = timestampToTime("data-create-time")
        const editTime = timestampToTime("data-edit-time")
        // Add small text
        div.innerText = `${createTime}\n${editTime}`
        div.style.fontSize = "0.5em"
    })
}
