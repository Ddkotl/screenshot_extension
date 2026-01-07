export function showToast(message: string, icon: string): void {
    const toast = document.createElement("div");
    toast.className = "screenshot-toast";

    // Добавляем иконку (галочку) и текст
    toast.innerHTML = `
    <span class="screenshot-toast-icon">${icon}</span>
    <span>${message}</span>
  `;

    document.body.appendChild(toast);

    // Плавное появление (через микро-задержку для срабатывания transition)
    setTimeout(() => toast.classList.add("show"), 10);

    // Удаление через 3 секунды
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300); // Ждем окончания анимации
    }, 3000);
}