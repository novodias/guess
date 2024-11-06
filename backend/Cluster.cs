using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Backend;

public class DataReceivedEventArgs(string data) : EventArgs
{
    public DateTime Time { get; init; }
    public string Data { get; init; } = data;
}

public class WebSocketServer 
{
    public WebSocketServer() 
    {
        Socket = new TcpListener(IPAddress.Parse("127.0.0.1"), 3001);
        Listen = true;
    }

    private TcpListener Socket { get; set; }
    private bool Listen;

    public AsyncEvent<DataReceivedEventArgs>? OnDataReceived = null;

    private async Task HandleClientAsync(TcpClient client)
    {
        using NetworkStream ns = client.GetStream();
        byte[] bytes = new byte[client.Available];
        ns.Read(bytes, 0, bytes.Length);
        var data = Encoding.UTF8.GetString(bytes);

        if (OnDataReceived != null)
        {
            await OnDataReceived.InvokeAsync(this, new DataReceivedEventArgs(data) { Time = DateTime.Now });
        }
    }

    public void Stop() => Listen = false;

    public async Task StartAsync()
    {
        while(Listen)
        {
            if (Socket.Pending())
            {
                await HandleClientAsync(await Socket.AcceptTcpClientAsync());
            }
            else
            {
                await Task.Delay(100);
            }
        }
    }
}