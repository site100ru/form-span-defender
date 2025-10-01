# Защита форм от спама

Система проверки форм обратной связи с защитой от ботов.

## Что внутри

- `form-protection.js` - проверка данных в браузере
- `tel.js` - маска телефона +7 (XXX) XXX-XX-XX
- `callback-mail.php` - обработка формы на сервере
- `page-spam-stats.php` - страница со статистикой
- `spam_log.txt` - файл логов (создается сам)

## Конфигурация

### JavaScript (form-protection.js)

javascript

```javascript
const VALIDATION_CONFIG = {
	requireAllFields: true, // Все поля обязательны
	nameOnlyCyrillic: true, // Имя только кириллицей
	emailOnlyLatin: true, // Email только латиницей
	phoneSameDigits: true, // Запрет 6 одинаковых цифр
	phoneSequentialDigits: true, // Запрет 6 последовательных цифр
	cityOnlyCyrillic: true, // Город только кириллицей
	phoneRussianOperators: true, // Только российские операторы
	honeypotName: true, // Honeypot поле
	phoneFullLength: true, // Полный номер телефона
	formTimestamp: true, // Проверка времени заполнения
};
```

### PHP (callback-mail.php)

php

```php
$config=[
    'validation'=>[
    'require_all_fields'=>true,
    'name_only_cyrillic'=>true,
    'email_only_latin'=>true,
    'phone_same_digits'=>true,
    'phone_sequential_digits'=>true,
    'city_only_cyrillic'=>true,
    'phone_russian_operators'=>true,
    'honeypot_name'=>true,
    'phone_full_length'=>true,
    'form_timestamp'=>true
]
];
```

## Критически важно

* Класс формы: class="protected-form"
* Honeypot поле: name="name" (должно быть скрыто)
* Основное имя: name="user_name" (НЕ name)
* Временная метка: name="form_timestamp"
* Блок ошибок: class="form-errors"
* Маска телефона: class="telMask"


## Настройка времени валидации

Изменение времени

JavaScript (form-protection.js):

```
if (timeSpent < 2) {  // Измените 2 на нужное значение (в секундах)
```

или

```
if (timeSpent > 3600) {  // 3600 = 1 час (в секундах)
```

PHP (callback-mail.php):

```
if ($timeSpent < 2) {  // Измените 2 на нужное значение (в секундах)
```

или

```
if ($timeSpent > 3600) {  // 3600 = 1 час (в секундах)
```
