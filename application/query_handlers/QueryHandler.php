<?php

namespace service\QueryHandler;

class QueryHandler {
    protected $table_name = '';
    protected $primary_key = '';
    protected $field_map = [];
    protected $CI = null;

    // "user":"user(id=xxx)"
    // "app":"app(user=user.id|limit=10｜order_by=create,DESC)"
    // "userList":"user(id=[xxx,yyy,zzz])"
    public function handle(array $condition)
    {
        $isList = array_keys($condition)[0] != $this->primary_key || strlen($condition[$this->primary_key]) != 32;
        $this->CI = & get_instance();

        foreach ($condition as $key => $item) {
            $key = $this->_getActualField($key);

            if ($key === 'limit') {
                $limit = explode(',', $item);
                $this->CI->db->limit($limit[0], $limit[1] ? $limit[1] : 0);
            } else if ($key === 'order_by') {
                $orderby = explode(',', $item);
                $orderby[0] = $this->_getActualField($orderby[0]);
                $this->CI->db->order_by($orderby[0], $orderby[1] ? $orderby[1] : 'ASC');
            } else if (is_array($item)) {
                $this->CI->db->where_in($key, $item);
            } else {
                $this->CI->db->where($key, $item);
            }
        }

        $this->custom($condition);

        $query = $this->CI->db->get($this->table_name);
        if ($isList) {
            $result = $query->result_array();
        } else {
            $result = $query->row_array();
        }

        $result = $this->normalize($result, $isList);

        $result = $this->after($result);

        return $result;
    }

    private function _getActualField(string $key)
    {
        if (!$key || !$this->field_map || !in_array($key, $this->field_map)) {
            return $key;
        }

        return array_search($key, $this->field_map);
    }

    public function normalize(array $data, bool $isList) {
        if (!$data) {
            return $data;
        }

        if (!$isList) {
            $data = [$data];
        }

        $final = [];
        foreach ($data as $item) {
            $itemFinal = [];
            foreach ($item as $key => $val) {
                if ($this->field_map[$key]) {
                    $itemFinal[$this->field_map[$key]] = $val;
                }
            }

            array_push($final, $itemFinal);
        }

        return $isList ? $final : $final[0];
    }

    public function custom($condition) {}
    public function after(array $data) {
        return $data;
    }
}
