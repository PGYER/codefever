<?php

set_time_limit(0);
use service\Utility\UUID;
use GuzzleHttp\Client;

class Repository_webhook extends CI_Controller {
    private $_eventDataMap = [
        'rKey' => 'repositoryId',
        'gKey' => 'groupId',
        'uid' => 'userId',
        'mrKey' => 'mergerequestId',
        'sourceRKey' => 'sourceRepositoryId',
        'sourceGKey' => 'sourceGroupId',
        'mrrKey' => 'reviewId',
    ];

    public function __construct()
    {
        parent::__construct();
        $this->load->library('service');
        $this->load->model('Repository_model', 'repositoryModel');
        $this->load->model('Group_model', 'groupModel');
        $this->load->model('User_model', 'userModel');
    }

    public function run()
    {
        $events = $this->repositoryModel->getRepositoryWebhookEvents();
        if (!$events) {
            exit(0);
        }

        $client = new Client();

        foreach ($events as $event) {
            $repository = $this->repositoryModel->get($event['r_key']);
            if (!$repository) {
                continue;
            }

            $group = $this->groupModel->get($repository['g_key']);
            if (!$group) {
                continue;
            }

            $user = $this->userModel->get($event['rwe_user']);
            if (!$user) {
                continue;
            }

            $uuid = UUID::getUUID();

            $body = json_encode([
                'event' => $event['rwe_type'],
                'data' => $this->_normalizeEventData(json_decode($event['rwe_data'], TRUE)),
                'repository' => [
                    'id' => $repository['r_key'],
                    'url' => YAML_HOST . '/' . $group['g_name'] . '/' . $repository['r_name'],
                ],
                'sender' => [
                    'id' => $user['u_key'],
                    'name' => $user['u_name'],
                ],
            ]);

            $headers = [
                'Request URL' => $event['rw_url'],
                'Request method' => 'POST',
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'CodeFever-Webhook',
                'X-CodeFever-Id' => $uuid,
                'X-CodeFever-Event' => $event['rwe_type'],
                'X-CodeFever-Signature' => 'md5=' . $this->_signature($body, $event['rw_secret']),
            ];

            $start = microtime(TRUE);

            try {
                $response = $client->request(
                    'POST',
                    $event['rw_url'],
                    [
                        'body' => $body,
                        'headers' => $headers,
                        'http_errors' => FALSE,
                        'timeout' => 30,
                    ]
                );

                $status = $response->getStatusCode();
                $responseHeaders = $response->getHeaders();
                $responseBody = (string) $response->getBody();
            } catch (Exception $e) {
                $status = 400;
                $responseHeaders = [];
                $responseBody = '';
            }

            if ($status == 200) {
                $this->repositoryModel->deleteRepositoryWebhookEvent($event['rwe_key']);
            }

            $this->repositoryModel->addRepositoryWebhookLog([
                'rwl_id' => $uuid,
                'rw_key' => $event['rw_key'],
                'rwl_request' => json_encode([
                    'headers' => $headers,
                    'body' => $body,
                ]),
                'rwl_response' => json_encode([
                    'headers' => $responseHeaders,
                    'body' => $responseBody,
                ]),
                'rwl_start' => $start,
                'rwl_end' => microtime(TRUE),
                'rwl_status' => $status,
            ]);
        }
    }

    private function _signature(string $data, string $secret)
    {
        return md5($data . ($secret ? $secret : ''));
    }

    private function _normalizeEventData(array $data)
    {
        $final = [];
        foreach ($data as $key => $val) {
            $final[isset($this->_eventDataMap[$key]) ? $this->_eventDataMap[$key] : $key] = $val;
        }

        return $final;
    }
}