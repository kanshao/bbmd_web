import React from 'react';
import katex from 'katex';


class Formula extends React.Component {

    getFormula (model_type){
        // LaTeX style formula
        // Live editing: https://khan.github.io/KaTeX/
        switch(model_type){
        case 'DGa':
            return 'f(dose) = a + (1 - a) \\times CumGamma(c \\times dose, b)';
        case 'DLg':
            return 'f(dose) = \\frac{1}{1+e^{-a-b \\times dose}}';
        case 'DLl':
            return 'f(dose) = a+\\frac{(1-a)}{1+e^{-c-b \\times \\log(dose)}}';
        case 'DPr':
            return 'f(dose) = \\Phi(a+b \\times dose)';
        case 'DLp':
            return 'f(dose) = a + (1-a) \\times \\Phi(c+b \\times \\log(dose))';
        case 'DM1':
            return 'f(dose) = a + (1-a) \\times (1 - e^{-b \\times dose})';
        case 'DM2':
            return 'f(dose) = a + (1-a) \\times (1 - e^{-b \\times dose -c \\times dose^{2}})';
        case 'DWe':
            return 'f(dose) = a + (1-a) \\times (1 - e^{-c \\times dose^{b}})';
        case 'DHi':
            return 'f(dose) = a \\times g + \\frac{a - a \\times g}{1 + e^{-c - b \\times log(dose)}}';
        case 'CE2':
            return 'f(dose) = a \\times e^{b \\times dose}';
        case 'CE3':
            return 'f(dose) = a \\times e^{b \\times dose^g}';
        case 'CE4':
            return 'f(dose) = a \\times [c-(c-1) \\times e^{-b \\times dose}]';
        case 'CE5':
            return 'f(dose) = a \\times [c-(c-1) \\times e^{-(b \\times dose)^g}]';
        case 'CHi':
            return 'f(dose) = a + \\frac{b \\times dose^g}{c^g + dose^g}';
        case 'CPw':
            return 'f(dose) = a + b \\times dose^g';
        case 'CMm':
            return 'f(dose) = a + \\frac{b \\times dose}{c + dose}';
        case 'CLi':
            return 'f(dose) = a + b \\times dose';
        default:
            return '';
        }
    }

    renderFormula(){
        katex.render(
            this.getFormula(this.props.model_type),
            this.refs.formula
        );
    }

    componentDidMount(){
        this.renderFormula();
    }

    componentDidUpdate(){
        this.renderFormula();
    }

    render(){
        return (
            <div id='formulaHolder'>
                <p className='text-center lead' ref='formula'></p>
            </div>
        );
    }

}

export default Formula;
