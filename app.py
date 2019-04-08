from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def colorpicker():
   return render_template("colorpicker.html")

@app.route('/licence')
def licence():
   return render_template("licence.html")

if __name__ == "__main__":
    app.run(debug=True)