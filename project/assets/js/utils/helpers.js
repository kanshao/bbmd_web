import _ from 'underscore';
import Bokeh from 'Bokeh';
import moment from 'moment';


var helpers = {
    noop: function(){
    },
    printStatistic: function(v){
        if (!_.isNumber(v)) return v;
        if (v===0) return '0';
        return (Math.abs(v) > 0.001) ? v.toPrecision(3) : v.toExponential(3);
    },
    isntInt: function(n) {
        return n % 1 !== 0;
    },
    printPercentage: function(v){
        return this.printStatistic(v*100) + '%';
    },
    renderBokeh: function(par, data){
        let id = data.render_items[0].elementid;

        if(document.getElementById(id) !== null){
            return;
        }

        par.innerHTML = '';

        let el = document.createElement('div');
        el.setAttribute('id', id);
        el.setAttribute('class', 'bk-plotdiv');

        par.appendChild(el);
        par.setAttribute('class', 'bk-root');

        Bokeh.embed.embed_items(data.docs_json, data.render_items);
    },
    fetchGet: {
        credentials: 'same-origin',
    },
    fetchPost: function(csrf, obj, verb='POST'){
        obj['csrfmiddlewaretoken'] = csrf;
        return {
            credentials: 'same-origin',
            method: verb,
            headers: new Headers({
                'X-CSRFToken': csrf,
                'content-type': 'application/json',
            }),
            body: JSON.stringify(obj),
        };
    },
    fetchDelete: function(csrf){
        return {
            credentials: 'same-origin',
            method: 'DELETE',
            headers: new Headers({
                'X-CSRFToken': csrf,
                'content-type': 'application/json',
            }),
            body: JSON.stringify({csrfmiddlewaretoken:  csrf}),
        };
    },
    getValue(target){
        switch(target.type){
        case 'checkbox':
            return target.checked;
        case 'number':
            return parseFloat(target.value);
        case 'select-one':  // use isFinite in-case value is 0
            let val = parseInt(target.value);
            return (_.isFinite(val)) ? val : target.value;
        case 'text':
        case 'textarea':
        default:
            return target.value;
        }
    },
    getPatch(originalObj, newObj){
        let patch = {};
        _.each(newObj, function(v, k){
            if (originalObj[k] !== v){
                if (v instanceof Array || v instanceof Object){
                    if (JSON.stringify(originalObj[k]) != JSON.stringify(v)){
                        patch[k] = v;
                    }
                } else {
                    patch[k] = v;
                }
            }
        });
        return patch;
    },
    datetimeFormat(dt){
        return moment(dt).format('MMMM Do YYYY, h:mm:ss a');
    },
    goBack(e){
        if (e && e.preventDefault) e.preventDefault();
        window.history.back();
    },
    getInputDivClass(name, errors, extra=[]){
        extra.push('form-group');
        if (errors && errors[name]) extra.push('has-error');
        return extra.join(' ');
    },
    deepCopy(object){
        return JSON.parse(JSON.stringify(object));
    },
};

export default helpers;
