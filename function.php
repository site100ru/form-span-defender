<?php
//function.php
function mytheme_start_session()
{
    if (!session_id()) {
        session_start();
    }
}
add_action('init', 'mytheme_start_session', 1);

// Инициализация переменных сессии
function mytheme_init_session_vars()
{
    // Устанавливаем значения по умолчанию, если они не существуют
    if (!isset($_SESSION['win'])) {
        $_SESSION['win'] = 'none';
    }
    if (!isset($_SESSION['recaptcha'])) {
        $_SESSION['recaptcha'] = '';
    }
}
add_action('wp_loaded', 'mytheme_init_session_vars');
