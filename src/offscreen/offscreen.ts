chrome.runtime.onMessage.addListener(
    async (msg) => {
        if (msg.action === "copy-image") {
            const blob: Blob = msg.blob
            const item = new ClipboardItem({
                "image/png": blob
            })
            await navigator.clipboard.write([item])
        }
    }
)