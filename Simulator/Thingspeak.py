import requests
import pandas as pd
api_key = "M91T0VEDMWME279O"

def clear_line_in_channel():
    # Construct the API URL for deleting a specific entry
    url = f"https://api.thingspeak.com/channels/2217645/feeds.json"

    parameters = {
    "api_key": 'JE66GTAOJ1J6L6OO'
    }
    
    # Send a DELETE request to remove the entry
    response = requests.delete(url, params = parameters)
    
    # Check the response status code to determine if the deletion was successful
    if response.status_code == 200:
        return True
    else:
        print('falha no Delete do ThingSpeak')
        return False

def get_data():
    tentativa = 0
    api_key = "M91T0VEDMWME279O"
    url = f"https://api.thingspeak.com/channels/2217645/feeds.json"

    #query parameters
    parameters = {
        "results": 3,
        "api_key": api_key
    }

    # Send the HTTP GET request
    response = requests.get(url, params = parameters)

    while tentativa < 3:
        # Check the response status
        if response.status_code == 200:
            feeds = response.json()['feeds']
            data = pd.json_normalize(feeds)
            return data
        else:
            tentativa += 1
    
"""     print('falha na leitura ThingSpeak')
    return pd.DataFrame() 
        

# Call the function to clear the line in the channel
clear_line_in_channel()
 """
