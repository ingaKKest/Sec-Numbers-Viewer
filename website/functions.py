from edgar import *
import pandas as pd
from tabulate import tabulate


def finanical_statements(ticker):
    set_identity("Michael Mccallum mike.mccalum@indigo.com")
    company = Company(f"{ticker}")

    try:
        reports = company.get_filings(form="10-K")
    except:
        return False
    return reports

def report_shower(index, reports):
    finanical_statement_data = []
    while True:
        report = reports[index]
        try:
            report_obj = report.obj()
            finances = report_obj.financials
            balance_sheet = finances.get_balance_sheet().get_dataframe()
            cash_flow = finances.get_cash_flow_statement().get_dataframe()
            income_statement = finances.get_income_statement().get_dataframe()
            statements = [income_statement, cash_flow, balance_sheet]

            for statement in statements:
                statement = statement.drop(columns=["concept"]).reset_index()
                for i, column in enumerate(statement.columns[1:]):  # Skip the first column ('Label')
                    # Get the sum of the next 3 columns for the current column's rows
                    statement[column] = pd.to_numeric(statement[column], errors='coerce')
                    # Subtract the sum of the next 3 columns from the current
                    statement[column] = statement[column].apply(
                        lambda x: f"{x / 1000:,.2f}" if x >= 1000 else f"{x:,.2f}")
                finanical_statement_data.append(statement)
            break
        except:
            index -= 1
    income_statement, cash_flow, balance_sheet = finanical_statement_data
    return income_statement, cash_flow, balance_sheet, index

def report_view(index, reports):
    report = reports[index]
    report.homepage.open()