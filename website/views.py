from flask import Flask, request, jsonify, render_template, Blueprint
from website.functions import finanical_statements, report_shower, report_view

views = Blueprint('views', __name__)



@views.route('/')
def home():
    return render_template("home.html")

index = 0
reports = False
starting_index = 100000

@views.route('/send_input', methods=['POST'])
def SEC_data():
    global index, reports, starting_index
    data = request.get_json()  # Get the JSON data from the request
    user_input = data.get("input")  # Get the 'input' key from the JSON
    reports = finanical_statements(user_input)
    if reports is False:
        return jsonify({"error": "Please enter a valid ticker symbol."}), 400 
    index = len(reports) - 1
    income_statement, cash_flow, balance_sheet, index = report_shower(index, reports)
    income_statement = income_statement.to_dict(orient='records')
    balance_sheet = balance_sheet.to_dict(orient='records')
    cash_flow = cash_flow.to_dict(orient='records')

    starting_index = index

    return jsonify([income_statement, cash_flow, balance_sheet])

@views.route('/next_year', methods=['POST'])
def next_year_data():
    global index, reports
    data = request.get_json()
    add = data.get("input_value", False)
    if add is True:
        index -= 1
    else:
        index += 1
    income_statement, cash_flow, balance_sheet, index = report_shower(index, reports)
    income_statement = income_statement.to_dict(orient='records')
    balance_sheet = balance_sheet.to_dict(orient='records')
    cash_flow = cash_flow.to_dict(orient='records')
    
    
    return jsonify({"reports": [income_statement, cash_flow, balance_sheet], "index": index, "starting_index": starting_index})

@views.route('/view_report', methods=['POST'])
def view_report():
    global index, reports
    report_view(index, reports)
    return jsonify("report")