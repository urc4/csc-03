import pandas as pd

def EscreverHTML(df:pd.DataFrame, filepath):
    html = '''<meta http-equiv="refresh" content="20">
    <!DOCTYPE html>
<html>
<head>
  <title>Table Example</title>
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
''' + f'''<body>
  {df.to_html(index=False)}
</body>
</html>'''
    with open(filepath, 'w') as f:
        f.write(html)

def update_html_content(df:pd.DataFrame, output_file):
    with open('C:/Users/Othon/Desktop/ITA/1º comp/CSC-03/Simulador/template.html', 'r') as file:
        html_content = file.read()

    # Replace the placeholder with the dynamic content
    html_content = html_content.replace('{{dynamic_content}}', df.to_html())

    with open(output_file, 'w') as file:
        file.write(html_content)

#! Testes
if __name__ == '__main__':
    EscreverHTML(pd.DataFrame({'a':[1], 'b':[2]}), 'C:/Users/Othon/Desktop/ITA/1º comp/CSC-03/Simulador/monitoramento.html')