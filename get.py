import requests

url = "https://tu-api.onrender.com/image"

response = requests.get(url)

if response.status_code == 200:

    with open("received.jpg", "wb") as f:
        f.write(response.content)

    print("Imagen recibida")

else:
    print("Error al obtener imagen")