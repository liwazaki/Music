<?php
header('Content-Type: text/html; charset=utf-8');
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$device = trim($_POST['device'] ?? '');
$message = trim($_POST['message'] ?? '');

if(!$name || !$email || !$device || !$message){
  echo "<h1>Error</h1><p>Please fill required fields. <a href='contact.html'>Back</a></p>";
  exit;
}

// In production: sanitize, store to DB or send email with proper headers
// For demo, just echo back
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Thanks</title></head>
<body>
  <h1>Thanks, <?php echo htmlspecialchars($name); ?></h1>
  <p>We received your message. Device: <?php echo htmlspecialchars($device); ?></p>
  <p><a href="index.html">Return home</a></p>
</body>
</html>
