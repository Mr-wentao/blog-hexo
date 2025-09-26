```python
import socket
import time

def telnet_check(host, port, timeout=1):
    """
    基于socket检测主机端口是否可通（替代telnetlib）
    :param host: 目标主机（IP或域名）
    :param port: 目标端口（整数）
    :param timeout: 超时时间（秒），默认1秒
    :return: 布尔值 -> True（通）/ False（不通）
    """
    # 创建TCP socket对象（AF_INET=IPv4，SOCK_STREAM=TCP）
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        # 设置连接超时时间（关键：确保1秒超时）
        sock.settimeout(timeout)
        # 尝试建立TCP连接（模拟Telnet端口探测）
        sock.connect((host, port))
        return True  # 连接成功 = 端口通
    except (socket.timeout,  # 超时（端口不通或网络延迟）
            ConnectionRefusedError,  # 连接被拒绝（端口存在但无服务）
            socket.gaierror,  # 域名解析失败（主机不存在）
            OSError):  # 其他网络错误（如主机不可达）
        return False
    finally:
        # 无论成功/失败，都关闭socket释放资源
        sock.close()

def batch_scan(targets, timeout=1):
    """
    批量探测目标列表，不通则继续下一个
    :param targets: 目标列表，格式为 [(host1, port1), (host2, port2), ...]
    :param timeout: 单个目标超时时间（秒）
    """
    print(f"=== Telnet端口批量探测（超时{timeout}秒）===\n")
    total = len(targets)
    
    for index, (host, port) in enumerate(targets, 1):
        print(f"[{index}/{total}] 探测中：{host}:{port}")
        start_time = time.time()
        
        # 执行探测
        is_open = telnet_check(host, port, timeout)
        
        # 计算耗时（保留4位小数）
        cost_time = round(time.time() - start_time, 4)
        # 输出结果
        status = "通" if is_open else "不通"
        print(f"[{index}/{total}] 结果：{host}:{port} {status}（耗时：{cost_time}秒）\n")

if __name__ == "__main__":
    # --------------------------
    # 配置待探测的目标（可自行修改）
    # --------------------------
    target_list = [
        ("192.168.1.1", 443),
        ("192.168.1.2", 443),  
        ("192.168.1.3", 443),  
    ]
    
    # 执行批量探测（超时1秒）
    batch_scan(target_list, timeout=1)
    print("=== 所有目标探测完成 ===")
```