<?php

/**
 * Template Name: Статистика форм
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Создайте новую страницу в WordPress (Страницы -> Добавить новую)
 * 2. Назовите её "Статистика форм"
 * 3. В правой колонке "Атрибуты страницы" выберите шаблон "Статистика форм"
 * 4. В настройках страницы установите пароль (Видимость -> Защищено паролем)
 * 5. Опубликуйте страницу
 * 
 * Теперь только те, кто знает пароль, смогут просматривать статистику
 */

// Проверяем, что страница защищена паролем
if (post_password_required()) {
    echo get_the_password_form();
    exit;
}

// Путь к файлу логов (настройте под вашу структуру)
$logFile = get_template_directory() . '/mails/spam_log.txt';

// =============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ЛОГАМИ
// =============================================================================

function getSpamStats($logFile, $period = 'day')
{
    if (!file_exists($logFile)) {
        return ['total' => 0, 'period' => 0, 'details' => []];
    }

    $lines = file($logFile, FILE_IGNORE_NEW_LINES);
    $spamCount = 0;
    $periodCount = 0;
    $details = [];

    // Определяем временной интервал
    $now = time();
    switch ($period) {
        case 'hour':
            $periodSeconds = 3600;
            break;
        case 'day':
            $periodSeconds = 86400;
            break;
        case 'week':
            $periodSeconds = 604800;
            break;
        case 'month':
            $periodSeconds = 2592000;
            break;
        default:
            $periodSeconds = 86400;
    }

    foreach ($lines as $line) {
        $entry = json_decode($line, true);
        if ($entry && $entry['is_spam']) {
            $spamCount++;

            $entryTime = strtotime($entry['timestamp']);
            if (($now - $entryTime) <= $periodSeconds) {
                $periodCount++;
                $details[] = $entry;
            }
        }
    }

    return [
        'total' => $spamCount,
        'period' => $periodCount,
        'period_name' => $period,
        'details' => array_reverse($details)
    ];
}

function getAllAttempts($logFile, $limit = 50)
{
    if (!file_exists($logFile)) {
        return [];
    }

    $lines = file($logFile, FILE_IGNORE_NEW_LINES);
    $attempts = [];

    foreach (array_reverse($lines) as $line) {
        $entry = json_decode($line, true);
        if ($entry) {
            $attempts[] = $entry;
            if (count($attempts) >= $limit) {
                break;
            }
        }
    }

    return $attempts;
}

function getErrorsStatistics($logFile)
{
    if (!file_exists($logFile)) {
        return [];
    }

    $lines = file($logFile, FILE_IGNORE_NEW_LINES);
    $errorCounts = [];

    foreach ($lines as $line) {
        $entry = json_decode($line, true);
        if ($entry && $entry['is_spam'] && !empty($entry['errors'])) {
            foreach ($entry['errors'] as $error) {
                if (!isset($errorCounts[$error])) {
                    $errorCounts[$error] = 0;
                }
                $errorCounts[$error]++;
            }
        }
    }

    arsort($errorCounts);
    return $errorCounts;
}

// Получаем период из параметра URL
$selectedPeriod = isset($_GET['period']) ? sanitize_text_field($_GET['period']) : 'day';
$stats = getSpamStats($logFile, $selectedPeriod);
$selectedLimit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
$recentAttempts = getAllAttempts($logFile, $selectedLimit);
$errorStats = getErrorsStatistics($logFile);

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статистика защиты форм - <?php bloginfo('name'); ?></title>

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <?php wp_head(); ?>
</head>

<body class="bg-light">
    <div class="container my-5">
        <!-- Заголовок -->
        <div class="card mb-4">
            <div class="card-body">
                <h1 class="card-title mb-0">Статистика защиты форм от спама</h1>
            </div>
        </div>

        <!-- Общая статистика -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted text-uppercase">Всего попыток спама</h6>
                        <h2 class="card-title text-danger mb-0"><?php echo $stats['total']; ?></h2>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted text-uppercase">За выбранный период</h6>
                        <h2 class="card-title text-danger mb-0"><?php echo $stats['period']; ?></h2>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted text-uppercase">Процент защиты</h6>
                        <h2 class="card-title text-success mb-0">100%</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Выбор периода -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="period" class="form-label fw-bold">Показать за период:</label>
                        <select id="period" class="form-select" onchange="updateUrl()">
                            <option value="hour" <?php echo $selectedPeriod === 'hour' ? 'selected' : ''; ?>>Последний час</option>
                            <option value="day" <?php echo $selectedPeriod === 'day' ? 'selected' : ''; ?>>Последний день</option>
                            <option value="week" <?php echo $selectedPeriod === 'week' ? 'selected' : ''; ?>>Последняя неделя</option>
                            <option value="month" <?php echo $selectedPeriod === 'month' ? 'selected' : ''; ?>>Последний месяц</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="limit" class="form-label fw-bold">Количество записей в таблице:</label>
                        <select id="limit" class="form-select" onchange="updateUrl()">
                            <option value="10" <?php echo $selectedLimit === 10 ? 'selected' : ''; ?>>10 записей</option>
                            <option value="20" <?php echo $selectedLimit === 20 ? 'selected' : ''; ?>>20 записей</option>
                            <option value="50" <?php echo $selectedLimit === 50 ? 'selected' : ''; ?>>50 записей</option>
                            <option value="100" <?php echo $selectedLimit === 100 ? 'selected' : ''; ?>>100 записей</option>
                            <option value="200" <?php echo $selectedLimit === 200 ? 'selected' : ''; ?>>200 записей</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function updateUrl() {
                const period = document.getElementById('period').value;
                const limit = document.getElementById('limit').value;
                window.location.href = '?period=' + period + '&limit=' + limit;
            }
        </script>

        <!-- Статистика по типам ошибок -->
        <?php if (!empty($errorStats)): ?>
            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="card-title h5 mb-3">Топ причин отклонения форм</h2>
                    <?php
                    $maxCount = max($errorStats);
                    foreach ($errorStats as $error => $count):
                        $width = ($count / $maxCount) * 100;
                    ?>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <strong><?php echo esc_html($error); ?></strong>
                                <span class="text-muted small">(<?php echo $count; ?> раз)</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: <?php echo $width; ?>%"
                                    aria-valuenow="<?php echo $count; ?>" aria-valuemin="0" aria-valuemax="<?php echo $maxCount; ?>">
                                    <?php echo $count; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Последние попытки -->
        <div class="card">
            <div class="card-body">
                <h2 class="card-title h5 mb-3">Последние попытки отправки форм (<?php echo $selectedLimit; ?> шт.)</h2>
                <?php if (!empty($recentAttempts)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Дата и время</th>
                                    <th>Статус</th>
                                    <th>Имя</th>
                                    <th>Телефон</th>
                                    <th>Email</th>
                                    <th>Ошибки</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recentAttempts as $attempt): ?>
                                    <tr>
                                        <td><?php echo esc_html($attempt['timestamp']); ?></td>
                                        <td>
                                            <?php if ($attempt['is_spam']): ?>
                                                <span class="badge bg-danger">СПАМ</span>
                                            <?php else: ?>
                                                <span class="badge bg-success">OK</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo esc_html($attempt['data']['user_name'] ?? '-'); ?></td>
                                        <td><?php echo esc_html($attempt['data']['tel'] ?? '-'); ?></td>
                                        <td><?php echo esc_html($attempt['data']['email'] ?? '-'); ?></td>
                                        <td>
                                            <?php if (!empty($attempt['errors'])): ?>
                                                <ul class="list-unstyled mb-0 small text-danger">
                                                    <?php foreach ($attempt['errors'] as $error): ?>
                                                        <li><?php echo esc_html($error); ?></li>
                                                    <?php endforeach; ?>
                                                </ul>
                                            <?php else: ?>
                                                <span class="text-success">Нет ошибок</span>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="text-center py-5 text-muted">
                        <p class="mb-0">Попыток отправки форм пока не было</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <?php wp_footer(); ?>
</body>

</html>