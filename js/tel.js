/**
 * МАСКА ДЛЯ ТЕЛЕФОНА
 * Формат: +7 (XXX) XXX-XX-XX
 */
document.addEventListener('DOMContentLoaded', function () {
    const phoneInputs = document.querySelectorAll('.telMask');

    phoneInputs.forEach(function (input) {
        input.value = '+7 (';

        input.addEventListener('input', function (e) {
            let digits = e.target.value.replace(/\D/g, '');

            // Обработка первой цифры
            if (digits[0] === '8') digits = '7' + digits.slice(1);
            if (digits[0] !== '7') digits = '7' + digits;

            // Ограничение длины
            digits = digits.slice(0, 11);

            // Форматирование
            let result = '+7';
            if (digits.length > 1) result += ' (' + digits.slice(1, 4);
            if (digits.length >= 4) result += ') ' + digits.slice(4, 7);
            if (digits.length >= 7) result += '-' + digits.slice(7, 9);
            if (digits.length >= 9) result += '-' + digits.slice(9, 11);

            e.target.value = result;
        });

        input.addEventListener('keydown', function (e) {
            // Защита префикса от удаления
            if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.selectionStart <= 4) {
                e.preventDefault();
            }
        });

        input.addEventListener('focus', function (e) {
            if (!e.target.value) e.target.value = '+7 (';
            // Курсор после +7 (
            setTimeout(() => e.target.setSelectionRange(4, 4), 0);
        });

        input.addEventListener('click', function (e) {
            // Если клик до начала ввода - переносим курсор
            if (e.target.selectionStart < 4) {
                e.target.setSelectionRange(4, 4);
            }
        });
    });
});