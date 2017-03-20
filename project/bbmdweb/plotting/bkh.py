import math
import numpy as np

from copy import deepcopy
from bokeh.models import HoverTool
from bokeh.models.ranges import DataRange1d
from bokeh.plotting import figure, ColumnDataSource
from bokeh.embed import _standalone_docs_json_and_render_items
from bokeh.model import _ModelInDocument
from bokeh.io import gridplot


class Plot(object):

    def __init__(self, data, *args, **kwargs):
        self.plot = figure(tools="save", toolbar_location="right")
        self.data = data
        self.set_data()
        self.set_metadata()

    def set_data(self):
        raise NotImplementedError('Abstract method')

    def set_metadata(self):
        self.plot.toolbar.logo = None
        self.plot.background_fill_color = "#EFE8E2"
        self.plot.grid.grid_line_alpha = 0.5
        self.plot.ygrid.band_fill_color = "#cacaca"
        self.plot.ygrid.band_fill_alpha = 0.3
        self.plot.title.text_font_size = "12pt"
        self.plot.xaxis.axis_label_text_font_size = "10pt"
        self.plot.xaxis.major_label_text_font_size = "8pt"
        self.plot.yaxis.axis_label_text_font_size = "10pt"
        self.plot.yaxis.major_label_text_font_size = "8pt"

    def as_json(self):
        with _ModelInDocument([self.plot]):
            (docs_json, render_items) = _standalone_docs_json_and_render_items([self.plot])
        return dict(
            docs_json=docs_json,
            render_items=render_items,
        )


class NullPlot(Plot):

    def set_data(self, show_line=True, show_hover=True):
        self.data = []


class DoseResponse(Plot):

    def set_dichotomous_data(self, show_line=True, show_hover=True):
        self.data["percent"] = ["{0:.1f}%".format(v*100.) for v in self.data['ratio']]
        source = ColumnDataSource(data=self.data)
        if show_line:
            self.plot.line(
                'dose', 'ratio', color="grey", line_width=2, source=source)
        self.dataset_glyphs = self.plot.circle(
            'dose', 'ratio', fill_color="seagreen", size=8, source=source)
        if show_hover:
            hover = HoverTool(
                tooltips=[
                    ("dose", "@dose"),
                    ("incidence", "@incidence"),
                    ("n", "@n"),
                    ("response", "@percent"),
                ],
                renderers=[self.dataset_glyphs],
                point_policy="follow_mouse",
                line_policy="nearest",
            )
            self.plot.add_tools(hover)

    def set_summary_continuous_ci(self, variance_type):
        doses = self.data['dose']
        resps = self.data['response']
        ci_span = (max(doses) - min(doses)) * 0.01
        if variance_type == 'SD':
            sds = self.data['variance']
        else:
            sds = [
                se*math.sqrt(n) for
                se, n in zip(self.data['variance'], self.data['n'])
            ]

        for i, dose in enumerate(doses):
            chg = sds[i] * 1.96
            self.plot.line(
                [dose, dose],
                [resps[i] - chg, resps[i] + chg],
                color="grey", line_width=2)

            self.plot.line(
                [dose-ci_span, dose+ci_span],
                [resps[i] + chg, resps[i] + chg],
                color="grey", line_width=2)

            self.plot.line(
                [dose-ci_span, dose+ci_span],
                [resps[i] - chg, resps[i] - chg],
                color="grey", line_width=2)

    def set_summary_continuous_data(self, show_line=True, show_hover=True):
        variance_type = self.data.pop('variance_type')
        source = ColumnDataSource(data=self.data)
        self.set_summary_continuous_ci(variance_type)
        if show_line:
            self.plot.line(
                'dose', 'response', color="grey", line_width=2, source=source)
        self.dataset_glyphs = self.plot.circle(
            'dose', 'response', fill_color="seagreen", size=8, source=source)
        if show_hover:
            hover = HoverTool(
                tooltips=[
                    ("dose", "@dose"),
                    ("n", "@n"),
                    ("response", "@response"),
                    (variance_type, "@variance"),
                ],
                renderers=[self.dataset_glyphs],
                point_policy="follow_mouse",
                line_policy="nearest",
            )
            self.plot.add_tools(hover)

    def set_individual_continuous_data(self, show_line=True, show_hover=True):
        source = ColumnDataSource(data=self.data)
        self.dataset_glyphs = self.plot.circle(
            'dose', 'response', fill_color="seagreen", size=8, source=source)
        if show_hover:
            hover = HoverTool(
                tooltips=[
                    ("dose", "@dose"),
                    ("response", "@response"),
                ],
                renderers=[self.dataset_glyphs],
                point_policy="follow_mouse",
                line_policy="nearest",
            )
            self.plot.add_tools(hover)

    def set_data(self, **kwargs):
        if self.data.get('incidence'):
            return self.set_dichotomous_data(**kwargs)
        elif self.data.get('variance'):
            return self.set_summary_continuous_data(**kwargs)
        else:
            return self.set_individual_continuous_data(**kwargs)

    def set_metadata(self):
        super(DoseResponse, self).set_metadata()
        self.plot.title = None
        self.plot.plot_width = 550
        self.plot.plot_height = 300
        self.plot.xaxis.axis_label = 'Dose'
        self.plot.yaxis.axis_label = 'Response'


class DoseResponseAndCurve(DoseResponse):

    def set_data(self):
        lines = self.data.pop('lines')
        source_line = ColumnDataSource(data=dict(
            dose=lines[0],
            lower=lines[1],
            median=lines[2],
            upper=lines[3],
        ))

        x = deepcopy(lines[0])
        x.extend(x[::-1])
        y = deepcopy(lines[1])
        y.extend(lines[3][::-1])

        x = np.array(x)
        y = np.array(y)

        x = x[~np.isnan(y)]
        y = y[~np.isnan(y)]

        patch_line = ColumnDataSource(data=dict(x=x, y=y))

        self.plot.patch(x='x', y='y', color="#67b1d8", alpha=0.4, source=patch_line)
        line_glpyh = self.plot.line(
            'dose', 'median', color="#CF5300", line_width=3, source=source_line)
        super(DoseResponseAndCurve, self).set_data(show_line=False, show_hover=True)

        line_hover = HoverTool(
            renderers=[line_glpyh],
            tooltips=[
                ("Dose", "@dose"),
                ("Median (5th, 95th)", "@median (@lower, @upper)"),
            ],
            line_policy="nearest",
        )

        self.plot.add_tools(line_hover)


class TestStatisticHistogram(DoseResponse):

    def set_data(self):
        fig = figure(width=400, plot_height=200, title="Test statistic")
        hist, edges = np.histogram(self.data['kernels']['test_stat'], density=True, bins=25)
        fig.quad(top=hist, bottom=0, left=edges[:-1], right=edges[1:],
                 fill_color="#036564", line_color="#033649")
        fig.line(
            self.data['kernels']['test_stat_kernel']['x'],
            self.data['kernels']['test_stat_kernel']['y'],
            line_color="#D95B43", line_width=4, alpha=0.8)
        fig.title.text_font_size = "12pt"
        self.plot = fig


class ParameterSummary(Plot):

    def set_data(self):
        d = self.data
        rows = []
        tools = 'pan,box_zoom,wheel_zoom,save,reset'

        # parameter estimations
        for param in d['parameter_names']:

            # kernel and histogram
            fig1 = figure(tools=tools, width=400, plot_height=200,
                          title="Parameter {}".format(param))

            hist, edges = np.histogram(d['parameters'][param], density=True, bins=25)
            fig1.quad(top=hist, bottom=0, left=edges[:-1], right=edges[1:],
                      fill_color="#036564", line_color="#033649")
            fig1.line(
                d['kernels'][param]['x'],
                d['kernels'][param]['y'],
                line_color="#D95B43", line_width=4, alpha=0.8)
            fig1.title.text_font_size = "12pt"

            # parameter variance w/ time-course
            source = ColumnDataSource(data=dict(
                x=range(len(d['parameters'][param])),
                y=d['parameters'][param]))
            fig2 = figure(tools=tools, width=500, plot_height=200, title="Parameter {}".format(param))
            fig2.line('x', 'y', color="#036564", line_width=1, source=source)
            fig2.title.text_font_size = "12pt"

            rows.append([fig1, fig2])

        self.plot = gridplot(rows, toolbar_options={
            'logo': None,
            'merge_tools': True,
            'toolbar_location': 'above',
        })

    def set_metadata(self):
        pass


class BenchmarkDosePlot(Plot):

    def get_single_plot(self):
        rows = []

        # weighted
        weighted = self.data['weighted']
        fig = self.plot_bmd(
            weighted['kernel']['x'],
            weighted['kernel']['y'],
            'Model average',
            line_color='#376eb3')
        rows.append([fig])

        # each individual model
        for d in self.data['models']:
            fig = self.plot_bmd(
                d['kernel']['x'],
                d['kernel']['y'],
                d['model_name'],
                line_color='#D95B43')
            rows.append([fig])

        x_max = weighted['kernel']['x'].max()
        return rows, x_max

    def get_dual_plot(self):
        rows = []

        # weighted
        weighted = self.data['weighted']
        fig1 = self.plot_bmd(
            weighted['added_kernel']['x'],
            weighted['added_kernel']['y'],
            'Model average: Added risk',
            line_color='#376eb3')
        fig2 = self.plot_bmd(
            weighted['extra_kernel']['x'],
            weighted['extra_kernel']['y'],
            'Model average: Extra risk',
            line_color='#376eb3')
        rows.append([fig1, fig2])

        # each individual model
        for d in self.data['models']:
            fig1 = self.plot_bmd(
                d['added_kernel']['x'],
                d['added_kernel']['y'],
                '{}: Added risk'.format(d['model_name']),
                line_color='#D95B43')
            fig2 = self.plot_bmd(
                d['extra_kernel']['x'],
                d['extra_kernel']['y'],
                '{}: Extra risk'.format(d['model_name']),
                line_color='#D95B43')
            rows.append([fig1, fig2])

        x_max = max(
            weighted['added_kernel']['x'].max(),
            weighted['extra_kernel']['x'].max()
        )
        return rows, x_max

    def set_data(self):
        # set same x-range for all models
        self.x_range = DataRange1d(start=0, end=10)  # end is initial guess

        weighted = self.data['weighted']
        if 'kernel' in weighted:
            rows, x_max = self.get_single_plot()
        elif 'added_kernel' in weighted and 'extra_kernel' in weighted:
            rows, x_max = self.get_dual_plot()

        self.x_range.end = x_max
        self.plot = gridplot(rows, toolbar_options={
            'logo': None,
            'merge_tools': True,
            'toolbar_location': 'above',
        })

    def plot_bmd(self, x, y, title, line_color):
        tools = 'pan,box_zoom,wheel_zoom,save,reset'
        fig = figure(x_range=self.x_range, width=400, plot_height=200,
                     title=title, tools=tools)
        fig.line(x, y, line_color=line_color, line_width=4, alpha=0.8)
        fig.title.text_font_size = "12pt"
        return fig

    def set_metadata(self):
        pass
