import requests
import numpy as np
import pandas as pd
pd.plotting.register_matplotlib_converters()
import matplotlib.pyplot as plt

class FeedingData:
    def get_data(self):
        # ThingSpeak channel ID and API key
        channel_id = 2209294 
        read_api_key = 'HQ3CGITOVYGEUBLW'     
        # URL for the API request: retrieving only the last 180 values to improve code's performance, 
        # since the app will show at most the last 180 days
        url = f"https://api.thingspeak.com/channels/{channel_id}/feeds.json?api_key={read_api_key}&results=180"
        # Send GET request to ThingSpeak API
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            feeds = data['feeds']
            self.feeding_data = pd.DataFrame(feeds)

            # Setting the dataframe's structure
            self.feeding_data.set_index('entry_id', inplace=True)
            self.feeding_data.rename(columns={'field1': 'leftover'}, inplace=True)
            self.feeding_data.rename(columns={'field2': 'scheduled time'}, inplace=True)
            self.feeding_data['leftover'] = pd.to_numeric(self.feeding_data['leftover'])
            # After integration, the subtrahend here should vary with the meal and be determined by data sent by the app
            self.feeding_data['eaten'] = self.feeding_data['quantity'] - self.feeding_data['leftover']
            self.feeding_data['protein'] = self.feeding_data['protein_percentage']/100*self.feeding_data['eaten']
            self.feeding_data['carbohydrate'] = self.feeding_data['carbohydrate_percentage']/100*self.feeding_data['eaten']
            self.feeding_data['fat'] = self.feeding_data['fat_percentage']/100*self.feeding_data['eaten']
            
            # New dataframe to store the total amount of food for each day
            # Grouping the data by 'day'(received from app separated of scheduled time) and calculating the sum of each column
            self.total_by_day = self.feeding_data.groupby('day').sum().reset_index()
            self.total_by_day = self.total_by_day.drop('scheduled_time', axis=1)
            self.total_by_day.rename(columns={'eaten': 'total_eaten'}, inplace=True)
        else:
            print("Error occurred while accessing ThingSpeak API:", response.text)

    def plot_data(self):
        # Define one method to plot all the data
        def plot(total_by_day,number_of_days):
            plt.figure(figsize=(10, 5))
            x_values = range(1,number_of_days+1)
            plt.plot(x_values, total_by_day['eaten'].tail(number_of_days),label='Current day', linewidth=2.5)
            plt.ylim(0, 165)
            
            if (number_of_days!=7):
                average_number = 5 if number_of_days == 30 else 15
                average = np.convolve(total_by_day['eaten'].tail(number_of_days), np.ones(average_number) / average_number, mode='valid')
                average_x_values = range(average_number-1, number_of_days)  
                plt.plot(average_x_values, average, color='red', label=f'Average of the last {average_number} days',linewidth=2.5)
            
            plt.ylabel('Mass in grams',fontsize=14)
            plt.xlabel('Day',fontsize=14)
            plt.xticks(fontsize=14)
            plt.yticks(fontsize=12)
            plt.title('Total consumption',fontsize=16)
            plt.legend(fontsize=14)
            
            # Integrate with the app or ThingSpeak here
            plt.savefig(f'total{number_of_days}.png', dpi=800)
    
            plt.figure(figsize=(10,5))
            x_values = range(1,number_of_days+1)
            plt.plot(x_values, total_by_day['protein'].tail(number_of_days),label='Protein',linewidth=2.5)
            plt.plot(x_values, total_by_day['carbohydrate'].tail(number_of_days),label='Carbohydrate', linewidth=2.5)
            plt.plot(x_values, total_by_day['fat'].tail(number_of_days),label='Fat',linewidth=2.5)
            plt.ylim(0, 165) 
            
            plt.ylabel('Mass in grams',fontsize=14)
            plt.xlabel('Day',fontsize=14)
            plt.xticks(fontsize=14)
            plt.yticks(fontsize=12)
            plt.title('Consumption by nutrient',fontsize=16)
            plt.legend(fontsize=14)

            # Integrate with the app or ThingSpeak here
            plt.savefig(f'bynutrient{number_of_days}.png',dpi=800)

        plot(self.total_by_day,7)
        plot(self.total_by_day,30)
        plot(self.total_by_day,180)

data = FeedingData()
data.get_data()
data.plot_data()