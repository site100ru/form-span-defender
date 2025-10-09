/**
 * СКРИПТ ЗАЩИТЫ ФОРМ ОТ СПАМА 
 * Поддержка множественных форм на странице
 */

// =============================================================================
// КОНФИГУРАЦИЯ МОДУЛЕЙ (включить/выключить проверки)
// =============================================================================
const VALIDATION_CONFIG = {
    // Для заказчика
    requireAllFields: true,          // Все поля обязательны (кроме города)
    nameOnlyCyrillic: true,          // Имя только кириллицей
    emailOnlyLatin: true,            // Email только латиницей
    phoneSameDigits: true,           // Проверка 6 одинаковых цифр подряд
    phoneSequentialDigits: true,     // Проверка 6 цифр по порядку
    cityOnlyCyrillic: true,          // Город только кириллицей
    phoneRussianOperators: true,     // Только российские операторы
    honeypotName: true,              // Скрытое поле имени (ловушка)

    // Для наших проектов
    phoneFullLength: true,           // Полный номер телефона
    formTimestamp: true              // Проверка времени заполнения
};

// =============================================================================
// СПРАВОЧНИК РОССИЙСКИХ КОДОВ ОПЕРАТОРОВ
// =============================================================================
const RUSSIAN_OPERATOR_CODES = [
    '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
    '980', '981', '982', '983', '984', '985', '986', '987', '988', '989',
    '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
    '930', '931', '932', '933', '934', '936', '937', '938', '939',
    '900', '901', '902', '903', '904', '905', '906', '908', '909',
    '950', '951', '952', '953', '954', '955', '956', '957', '958', '959',
    '999',
    '940', '941', '942', '943', '944', '945', '946', '947', '948', '949',
    '960', '961', '962', '963', '964', '965', '966', '967', '968', '969',
    '970', '971', '977', '978', '991', '992', '993', '994', '995', '996', '997'
];

// =============================================================================
// МОДУЛИ ВАЛИДАЦИИ
// =============================================================================

/**
 * Проверяет заполнение обязательных полей формы
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (requireAllFields: true)
 * 2. Если выключена (requireAllFields: false) - не работает модуль 
 * 3. Определяет список обязательных полей: имя (user_name), телефон (tel), email (email)
 * 4. Проходит по каждому обязательному полю и проверяет:
 *    - Существует ли значение в форме
 *    - Не является ли заполенное поле пустой строкой после удаления пробелов
 * 5. Для каждого незаполненного поля добавляет сообщение об ошибке
 */
function validateRequired(value) {
    if (!VALIDATION_CONFIG.requireAllFields) {
        return { valid: true };
    }

    if (!value || value.trim() === '') {
        return {
            valid: false,
            error: 'Это поле обязательно для заполнения'
        };
    }

    return { valid: true };
}

/**
 * Проверяет, что имя написано только кириллицей (русскими буквами)
 *
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (nameOnlyCyrillic: true)
 * 2. Если выключена (nameOnlyCyrillic: false) - не работает модуль 
 * 3. Создает регулярное выражение для проверки кириллицы:
 *    - А-Я: заглавные буквы
 *    - а-я: строчные буквы
 *    - Ёё: буква Ё в обоих регистрах
 *    - \s: пробелы
 *    - \-: дефисы (для двойных имен типа "Анна-Мария")
 * 4. Проверяет имя по паттерну
 * 5. Если найдены недопустимые символы (латиница, цифры и т.д.) - возвращает ошибку
 */
function validateNameCyrillic(name) {
    if (!VALIDATION_CONFIG.nameOnlyCyrillic || !name || name.trim() === '') {
        return { valid: true };
    }

    const cyrillicPattern = /^[А-Яа-яЁё\s\-]+$/;

    if (!cyrillicPattern.test(name)) {
        return {
            valid: false,
            error: 'Имя должно быть написано только кириллицей (русские буквы)'
        };
    }

    const lettersOnly = name.replace(/[^А-Яа-яЁё]/g, '');

    if (lettersOnly.length < 2) {
        return {
            valid: false,
            error: 'Имя должно содержать минимум 2 буквы'
        };
    }

    return { valid: true };
}

/**
 * Проверяет корректность email адреса и наличие только латинских символов
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (emailOnlyLatin: true)
 * 2. Если выключена (emailOnlyLatin: false) - не работает модуль 
 * 3. Первая проверка - только латинские символы:
 *    - a-z, A-Z: латинские буквы
 *    - 0-9: цифры
 *    - @._\-: специальные символы для email
 * 4. Если найдена кириллица или другие недопустимые символы - возвращает ошибку
 * 5. Вторая проверка - правильная структура email:
 *    - Символы до @
 *    - Символ @
 *    - Символы после @
 *    - Точка
 *    - Символы после точки (домен)
 * 6. Если структура неверная - возвращает ошибку о некорректном формате
 */
function validateEmailLatin(email) {
    if (!email || email.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.emailOnlyLatin) {
        return { valid: true };
    }

    if (/[а-яА-ЯёЁ]/.test(email)) {
        return {
            valid: false,
            error: 'Email должен содержать только латинские буквы'
        };
    }

    if (/xn--/.test(email)) {
        return {
            valid: false,
            error: 'Email должен содержать только латинские буквы'
        };
    }

    // Базовая проверка формата email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return {
            valid: false,
            error: 'Введите корректный email адрес'
        };
    }

    return { valid: true };
}

/**
 * Проверяет, что телефон не содержит 6 одинаковых цифр подряд
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (phoneSameDigits: true)
 * 2. Если выключена (phoneSameDigits: false) - не работает модуль
 * 3. Удаляет все нецифровые символы из номера телефона (скобки, дефисы, пробелы и т.д.)
 *    Например: "+7 (999) 111-11-11" -> "79991111111"
 * 4. Создает паттерн для поиска повторяющихся цифр:
 *    - (\d) - захватывает любую цифру в группу
 *    - \1{5} - проверяет, что эта же цифра повторяется еще 5 раз (итого 6 раз)
 * 5. Если найдена последовательность (например, "111111" или "777777") - возвращает ошибку
 *    Защита от спам-ботов, которые часто используют такие номера
 */
function validatePhoneSameDigits(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.phoneSameDigits) {
        return { valid: true };
    }

    const digitsOnly = phone.replace(/\D/g, '');
    const sameDigitsPattern = /(\d)\1{5}/;

    if (sameDigitsPattern.test(digitsOnly)) {
        return {
            valid: false,
            error: 'Телефон не может содержать 6 одинаковых цифр подряд'
        };
    }

    return { valid: true };
}

/**
 * Проверяет, что телефон не содержит 6 последовательных цифр (возрастающих или убывающих)
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (phoneSequentialDigits: true)
 * 2. Если выключена (phoneSequentialDigits: false) - не работает модуль
 * 3. Удаляет все нецифровые символы из номера телефона
 * 4. Проходит по всем возможным 6-значным подстрокам в номере:
 *    - Для номера из 11 цифр будет проверено 6 подстрок
 * 5. Для каждой подстроки проверяет два типа последовательностей:
 *    
 *    A) Возрастающая последовательность (например, "123456"):
 *       - Проходит по 5 парам соседних цифр
 *       - Проверяет, что каждая следующая цифра = предыдущая + 1
 *       - Если хоть одна пара не соответствует - последовательность не возрастающая
 *    
 *    B) Убывающая последовательность (например, "654321"):
 *       - Проходит по 5 парам соседних цифр
 *       - Проверяет, что каждая следующая цифра = предыдущая - 1
 *       - Если хоть одна пара не соответствует - последовательность не убывающая
 * 
 * 6. Если найдена возрастающая ИЛИ убывающая последовательность - возвращает ошибку
 *    Защита от спам-ботов, которые используют простые последовательности
 */
function validatePhoneSequentialDigits(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.phoneSequentialDigits) {
        return { valid: true };
    }

    const digitsOnly = phone.replace(/\D/g, '');

    for (let i = 0; i <= digitsOnly.length - 6; i++) {
        const sequence = digitsOnly.substr(i, 6);

        let isAscending = true;
        for (let j = 0; j < 5; j++) {
            if (parseInt(sequence[j + 1]) !== parseInt(sequence[j]) + 1) {
                isAscending = false;
                break;
            }
        }

        let isDescending = true;
        for (let j = 0; j < 5; j++) {
            if (parseInt(sequence[j + 1]) !== parseInt(sequence[j]) - 1) {
                isDescending = false;
                break;
            }
        }

        if (isAscending || isDescending) {
            return {
                valid: false,
                error: 'Телефон не может содержать 6 цифр подряд по порядку'
            };
        }
    }

    return { valid: true };
}

/**
 * Проверяет, что название города написано только кириллицей
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (cityOnlyCyrillic: true)
 * 2. Если выключена (cityOnlyCyrillic: false) - не работает модуль
 * 3. Проверяет, что поле города не пустое:
 *    - Если city не передан (null/undefined) - пропускает валидацию
 *    - Если city пустая строка после удаления пробелов - пропускает валидацию
 *    Это значит, что поле города НЕ обязательное, но если заполнено - должно быть кириллицей
 * 4. Создает регулярное выражение для проверки кириллицы:
 *    - А-Я: заглавные буквы
 *    - а-я: строчные буквы
 *    - Ёё: буква Ё в обоих регистрах
 *    - \s: пробелы (для городов типа "Нижний Новгород")
 *    - \-: дефисы (для городов типа "Ростов-на-Дону")
 * 5. Проверяет город по паттерну
 * 6. Если найдены недопустимые символы (латиница, цифры) - возвращает ошибку
 */
function validateCityCyrillic(city) {
    if (!city || city.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.cityOnlyCyrillic) {
        return { valid: true };
    }

    const cyrillicPattern = /^[А-Яа-яЁё\s\-]+$/;

    if (!cyrillicPattern.test(city)) {
        return {
            valid: false,
            error: 'Город должен быть написан только кириллицей'
        };
    }

    return { valid: true };
}

/**
 * Проверяет, что код оператора в номере телефона принадлежит российскому оператору
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (phoneRussianOperators: true)
 * 2. Если выключена (phoneRussianOperators: false) - не работает модуль
 * 3. Удаляет все нецифровые символы из номера телефона
 *    Например: "+7 (999) 111-22-33" -> "79991112233"
 * 4. Извлекает код оператора (3 цифры после первой):
 *    - В российском номере формат: +7 (XXX) YYY-YY-YY
 *    - Первая цифра: 7 или 8 (код страны)
 *    - Цифры с 1 по 3 (индексы): код оператора (например, "999", "916", "903")
 *    - substr(1, 3) извлекает 3 символа начиная с индекса 1
 * 5. Ищет извлеченный код в справочнике RUSSIAN_OPERATOR_CODES. При необходимости нужно добавить в RUSSIAN_OPERATOR_CODES значение оператора
 * 6. Если код не найден в справочнике - возвращает ошибку
 *    Это означает либо иностранный номер, либо несуществующий российский код
 *    Защита от спама с иностранных номеров
 */
function validateRussianOperator(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.phoneRussianOperators) {
        return { valid: true };
    }

    const digitsOnly = phone.replace(/\D/g, '');
    
    // Проверяем только если введено достаточно цифр
    if (digitsOnly.length < 4) {
        return { valid: true };
    }

    const operatorCode = digitsOnly.substr(1, 3);

    if (RUSSIAN_OPERATOR_CODES.indexOf(operatorCode) === -1) {
        return {
            valid: false,
            error: 'Указан некорректный код российского оператора'
        };
    }

    return { valid: true };
}

/**
 * Проверяет honeypot поле (скрытую ловушку для ботов)
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (honeypotName: true)
 * 2. Если выключена (honeypotName: false) - не работает модуль
 * 3. Получает значение скрытого поля 'name' из формы
 * 4. Логика:
 *    - В HTML форме есть поле <input name="name"> скрытое через CSS (display:none)
 *    - Обычные пользователи его не видят и не заполняют
 *    - Спам-боты видят поле в HTML и автоматически заполняют его
 * 5. Проверяет, заполнено ли honeypot поле:
 *    - Если поле пустое или содержит только пробелы - это реальный пользователь (ОК)
 *    - Если поле заполнено - это бот (блокировка ботов происходит на сервере, это нужно для статистики)
 */
function validateHoneypotName(formData) {
    if (!VALIDATION_CONFIG.honeypotName) {
        return { valid: true };
    }

    const honeypotValue = formData.get('name');
    if (honeypotValue && honeypotValue.trim() !== '') {
        return { valid: true };
    }

    return { valid: true };
}

/**
 * Проверяет, что номер телефона содержит ровно 11 цифр и правильный формат
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (phoneFullLength: true)
 * 2. Если выключена (phoneFullLength: false) - не работает модуль
 * 3. Удаляет все нецифровые символы из номера телефона
 *    Например: "+7 (999) 111-22-33" -> "79991112233"
 * 4. Первая проверка - количество цифр:
 *    - Российский номер должен содержать ровно 11 цифр
 *    - Формат: X XXX XXX-XX-XX (где X - цифра)
 *    - Если цифр меньше или больше 11 - возвращает ошибку
 *    - Примеры корректных: "79991234567", "89991234567" (11 цифр)
 *    - Примеры некорректных: "9991234567" (10 цифр), "379991234567" (12 цифр)
 * 5. Вторая проверка - первая цифра (код страны):
 *    - Российские номера начинаются с 7 (международный формат) или 8 (внутрироссийский)
 *    - digitsOnly[0] - это первая цифра номера
 *    - Если первая цифра не 7 и не 8 - возвращает ошибку
 *    - Примеры корректных: "79991234567", "89991234567"
 *    - Примеры некорректных: "39991234567" (начинается с 3), "19991234567" (начинается с 1)
 * 6. Если обе проверки пройдены - возвращает успешный результат
 */
function validatePhoneFullLength(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true };
    }

    if (!VALIDATION_CONFIG.phoneFullLength) {
        return { valid: true };
    }

    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length !== 11) {
        return {
            valid: false,
            error: 'Введите полный номер телефона (11 цифр)'
        };
    }

    if (digitsOnly[0] !== '7' && digitsOnly[0] !== '8') {
        return {
            valid: false,
            error: 'Номер должен начинаться с +7 или 8'
        };
    }

    return { valid: true };
}

/**
 * Проверяет время заполнения формы (защита от ботов)
 * 
 * Логика работы:
 * 1. Проверяет, включена ли валидация в конфигурации (formTimestamp: true)
 * 2. Если выключена (formTimestamp: false) - не работает модуль
 * 3. Получает текущее время отправки формы: Date.now()
 * 4. Преобразует timestamp из строки в число (время открытия формы)
 * 5. Проверяет наличие timestamp:
 *    - Если timestamp пустой или невалидный - возвращает ошибку
 *    - Это может означать, что форма была изменена или отправлена некорректно
 * 6. Вычисляет время заполнения формы в секундах:
 *    - timeSpent = (время_отправки - время_открытия) / 1000
 *    - Делим на 1000, т.к. Date.now() возвращает миллисекунды
 * 7. Минимальная проверка (защита от ботов):
 *    - Если форма заполнена менее чем за 2 секунды - это подозрительно быстро
 *    - Боты обычно заполняют формы мгновенно
 *    - Реальный человек физически не может ввести все данные за 2 секунды
 * 8. Максимальная проверка (защита от устаревших форм):
 *    - Если с момента открытия формы прошло более часа (3600 секунд)
 *    - Также защищает от атак с сохраненными старыми формами
 *    - При обнаружении возвращает ошибку с просьбой обновить страницу
 * 9. Если время заполнения в диапазоне 2 сек - 1 час - возвращает успешный результат
 */
function validateFormTimestamp(timestamp) {
    if (!VALIDATION_CONFIG.formTimestamp) {
        return { valid: true };
    }

    const submitTime = Date.now();
    const formOpenTime = parseInt(timestamp);

    if (!formOpenTime) {
        return {
            valid: false,
            error: 'Ошибка валидации формы'
        };
    }

    const timeSpent = (submitTime - formOpenTime) / 1000;

    if (timeSpent < 2) {
        return {
            valid: false,
            error: 'Форма заполнена слишком быстро'
        };
    }

    if (timeSpent > 3600) {
        return {
            valid: false,
            error: 'Форма устарела, пожалуйста, обновите страницу'
        };
    }

    return { valid: true };
}

// =============================================================================
// ФУНКЦИИ ОТОБРАЖЕНИЯ ОШИБОК
// =============================================================================

/**
 * Показывает ошибку для конкретного поля
 */
function showFieldError(field, errorMessage) {
    // Ищем существующий блок ошибки или создаем новый
    let errorBlock = field.parentElement.querySelector('.field-error');
    
    if (!errorBlock) {
        errorBlock = document.createElement('div');
        errorBlock.className = 'field-error';
        errorBlock.style.color = '#dc3545';
        errorBlock.style.fontSize = '0.875em';
        errorBlock.style.marginTop = '0.25rem';
        field.parentElement.appendChild(errorBlock);
    }

    errorBlock.textContent = errorMessage;
    errorBlock.style.display = 'block';
}

/**
 * Убирает ошибку с конкретного поля
 */
function hideFieldError(field) {
    const errorBlock = field.parentElement.querySelector('.field-error');
    if (errorBlock) {
        errorBlock.style.display = 'none';
    }
}

/**
 * Очищает все визуальные индикаторы с поля
 */
function clearFieldValidation(field) {
    const errorBlock = field.parentElement.querySelector('.field-error');
    if (errorBlock) {
        errorBlock.style.display = 'none';
    }
}

// =============================================================================
// ВАЛИДАЦИЯ КОНКРЕТНЫХ ПОЛЕЙ
// =============================================================================

/**
 * Валидирует поле "Имя"
 */
function validateNameField(field) {
    const value = field.value;
    
    // Проверка на обязательность
    let result = validateRequired(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка на кириллицу
    result = validateNameCyrillic(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    hideFieldError(field);
    return true;
}

/**
 * Валидирует поле "Email"
 */
function validateEmailField(field) {
    const value = field.value;
    
    // Проверка на обязательность
    let result = validateRequired(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка формата email
    result = validateEmailLatin(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    hideFieldError(field);
    return true;
}

/**
 * Валидирует поле "Телефон"
 */
function validatePhoneField(field) {
    const value = field.value;
    
    // Проверка на обязательность
    let result = validateRequired(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка полной длины
    result = validatePhoneFullLength(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка одинаковых цифр
    result = validatePhoneSameDigits(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка последовательных цифр
    result = validatePhoneSequentialDigits(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    // Проверка российского оператора
    result = validateRussianOperator(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    hideFieldError(field);
    return true;
}

/**
 * Валидирует поле "Город"
 */
function validateCityField(field) {
    const value = field.value;
    
    // Город не обязательное поле, проверяем только если заполнено
    if (!value || value.trim() === '') {
        clearFieldValidation(field);
        return true;
    }

    // Проверка на кириллицу
    const result = validateCityCyrillic(value);
    if (!result.valid) {
        showFieldError(field, result.error);
        return false;
    }

    hideFieldError(field);
    return true;
}

/**
 * Валидирует поле формы в зависимости от его имени
 */
function validateField(field) {
    const fieldName = field.getAttribute('name');
    
    switch(fieldName) {
        case 'user_name':
            return validateNameField(field);
        case 'email':
            return validateEmailField(field);
        case 'tel':
            return validatePhoneField(field);
        case 'city':
            return validateCityField(field);
        default:
            return true;
    }
}

/**
 * Валидирует всю форму перед отправкой
 */
function validateFormBeforeSubmit(form) {
    const formData = new FormData(form);
    let isValid = true;

    // Валидация всех видимых полей
    const fields = form.querySelectorAll('input[name="user_name"], input[name="email"], input[name="tel"], input[name="city"]');
    fields.forEach(function(field) {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // Проверка honeypot - если заполнено, блокируем форму (бот)
    const honeypotResult = validateHoneypotName(formData);
    if (!honeypotResult.valid) {
        isValid = false;
    }

    // Проверка timestamp
    const timestamp = formData.get('form_timestamp') || '';
    const timestampResult = validateFormTimestamp(timestamp);
    if (!timestampResult.valid) {
        isValid = false;
        // Показываем ошибку timestamp через alert, т.к. это системная ошибка
        alert(timestampResult.error);
    }

    return isValid;
}

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ
// =============================================================================

/**
 * Инициализирует защиту форм от спама на всех формах страницы с классом 'protected-form'
 */
function initFormProtection() {
    const forms = document.querySelectorAll('.protected-form');

    if (forms.length === 0) {
        return;
    }

    forms.forEach(function (form) {
        // Инициализация timestamp при загрузке страницы
        const timestampField = form.querySelector('[name="form_timestamp"]');
        if (timestampField) {
            timestampField.value = Date.now();
        }

        // Получаем все поля формы для валидации
        const fields = form.querySelectorAll('input[name="user_name"], input[name="email"], input[name="tel"], input[name="city"]');
        
        // Добавляем обработчики на каждое поле
        fields.forEach(function(field) {
            // Валидация при потере фокуса
            field.addEventListener('blur', function() {
                if (this.value.trim()) validateField(this);
            });

            // Валидация при вводе - только если уже показана ошибка
            field.addEventListener('input', function() {
                const errorBlock = this.parentElement.querySelector('.field-error');
                if (errorBlock && errorBlock.style.display === 'block') {
                    validateField(this);
                }
            });

            // Очистка ошибки при фокусе на пустое поле
            field.addEventListener('focus', function() {
                if (!this.value.trim()) clearFieldValidation(this);
            });
        });

        // Обработка модальных окон (если форма внутри модалки)
        const modalParent = form.closest('.modal');
        if (modalParent) {
            modalParent.addEventListener('show.bs.modal', function () {
                // Обновляем timestamp
                if (timestampField) {
                    timestampField.value = Date.now();
                }
                
                // Очищаем все ошибки и валидацию
                fields.forEach(function(field) {
                    clearFieldValidation(field);
                });
            });
        }

        // Обработка отправки формы
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Валидация всей формы
            const isValid = validateFormBeforeSubmit(form);

            if (!isValid) {
                return false;
            }

            // Отправка формы
            this.submit();
        });
    });
}

/**
 * ЗАПУСК ИНИЦИАЛИЗАЦИИ
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormProtection);
} else {
    // DOM уже загружен, запускаем сразу
    initFormProtection();
}