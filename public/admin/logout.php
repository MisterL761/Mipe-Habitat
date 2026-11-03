<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
entetes_securite();
demarrer_session();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && verifier_csrf($_POST['csrf'] ?? null)) {
    $_SESSION = [];
    session_destroy();
}
header('Location: login.php');
