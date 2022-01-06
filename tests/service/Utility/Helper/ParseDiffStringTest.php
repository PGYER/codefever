<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class ParseDiffStringTest extends TestCase {
    public function testParseDiffString()
    {
        $raw = <<<EOT
@@ -19,6 +19,11 @@ class Repository extends Base
         $this->load->model('Group_model', 'groupModel');
     }
    
+    public function t1()
+    {
+        return 't1';
+    }
+
     public function create_post ()
     {
         $userInfo = Request::parse()->authData['userData'];
EOT;
        $excepted = [
            [
                'original' => [
                    'name' => 'test.php',
                    'mode' => '100644',
                    'sha' => '0857f8b'
                ],
                'modified' => [
                    'name' => 'test.php',
                    'mode' => '100644',
                    'sha' => 'd6089d9'
                ],
                'diff' => [
                    'raw' => $raw,
                    'line' => [
                        '@@ -19,6 +19,11 @@ class Repository extends Base',
                        "         $this->load->model('Group_model', 'groupModel');",
                        '     }',
                        '    ',
                        '+    public function t1()',
                        '+    {',
                        "+        return 't1';",
                        '+    }',
                        '+',
                        '     public function create_post ()',
                        '     {',
                        "         $userInfo = Request::parse()->authData['userData'];",
                    ],
                    'additions' => 5,
                    'deletions' => 0,
                ],
                'type' => 'text'
            ]
        ];

        $actual = <<<EOT
diff --git a/test.php b/test.php
index 0857f8b..d6089d9 100644
--- a/test.php
+++ b/test.php
@@ -19,6 +19,11 @@ class Repository extends Base
         $this->load->model('Group_model', 'groupModel');
     }
    
+    public function t1()
+    {
+        return 't1';
+    }
+
     public function create_post ()
     {
         $userInfo = Request::parse()->authData['userData'];
EOT;
        $actual = Helper::parseDiffString($actual);

        $this->assertSame($excepted, $actual);
    }
}
