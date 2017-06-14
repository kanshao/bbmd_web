from rest_framework import serializers

from . import models
from utils.serializers import raise_field_validation_error


class RunSerializer(serializers.ModelSerializer):
    url = serializers.CharField(
        source='get_absolute_url', read_only=True)
    url_update = serializers.CharField(
        source='get_update_url', read_only=True)
    url_delete = serializers.CharField(
        source='get_delete_url', read_only=True)
    url_execute = serializers.CharField(
        source='get_execute_url', read_only=True)
    url_plot = serializers.CharField(
        source='get_plot_url', read_only=True)
    url_docx = serializers.CharField(
        source='get_docx_url', read_only=True)
    url_summary_json = serializers.CharField(
         source='get_summary_json_url', read_only=True)
    url_summary_txt = serializers.CharField(
         source='get_summary_txt_url', read_only=True)
    url_parameters = serializers.CharField(
        source='get_parameters_url', read_only=True)
    url_bmds = serializers.CharField(
        source='get_bmds_url', read_only=True)
    variance_type_display = serializers.CharField(
        source='get_variance_type_display', read_only=True)
    bmr_ranges = serializers.JSONField(
        source='get_bmr_bounding_ranges', read_only=True)
    has_dataset = serializers.BooleanField(
        read_only=True)

    def validate_data(self, data):
        data_type = data.get('data_type')
        dose = data.get('dose')
        n = data.get('n')
        incidence = data.get('incidence')
        response = data.get('response')
        variance = data.get('variance')

        # ensure datasets are complete
        if data_type in models.Run.DICHOTOMOUS_TYPES:
            if len(set([type(v) for v in [dose, n, incidence]])) != 1:
                raise serializers.ValidationError(
                    "If one value is required then all are")

            if type(dose) is list:

                if len(set([len(v) for v in [dose, n, incidence]])) != 1:
                    raise serializers.ValidationError(
                        "Input vectors (dose, N, incidence) must be same length")

                for i, j in zip(incidence, n):
                    if i > j:
                        raise serializers.ValidationError(
                            "Incidence must be <= N")

        elif data_type == 'C':

            if len(set([type(v) for v in [dose, n, response, variance]])) != 1:
                raise serializers.ValidationError(
                    "If one value is required then all are")

            if type(dose) is list:

                if len(set([len(v) for v in [dose, n, response, variance]])) != 1:
                    raise serializers.ValidationError(
                        "Input vectors (dose, n, response, variance) must be "
                        "same length")

        elif data_type == 'I':
            pass

        if len(dose) < 2:
            raise serializers.ValidationError('Requires >2 doses')

        if data_type in ['C', 'D']:
            last = dose[0]
            for val in dose[1:]:
                if val <= last:
                    raise serializers.ValidationError(
                        'Doses must be in increasing order')
                last = val

    def validate(self, data):
        if self.context['request'].user != self.instance.owner:
            raise serializers.ValidationError(
                "Cannot add unless you are the owner.")

        if data.get('dose'):
            self.validate_data(data)

        return data

    class Meta:
        model = models.Run
        fields = '__all__'


class ModelSettingsSerializer(serializers.ModelSerializer):
    url_plot = serializers.CharField(
        source='get_plot_url', read_only=True)
    url_parameter_plot = serializers.CharField(
        source='get_parameter_plot_url', read_only=True)
    run_executed = serializers.BooleanField(
        read_only=True)
    power_lower_bound_float = serializers.FloatField(
        source='get_power_lower_bound_display', read_only=True)

    class Meta:
        model = models.ModelSettings
        exclude = ('fit_summary_dict', 'vectors', 'plotting', )

    def validate(self, data):
        run = self.instance.run if self.instance else data['run']
        if self.context['request'].user != run.owner:
            raise serializers.ValidationError(
                "Cannot add unless you are the owner.")

        return data


class BMDAnalysisModelSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        ret = super(BMDAnalysisModelSerializer, self).to_representation(instance)
        ret['stats'] = instance.get_stats_for_table()
        return ret

    class Meta:
        model = models.BMDAnalysisModel
        exclude = ('vectors', 'summary', )


class BMDAnalysisSerializer(serializers.ModelSerializer):
    url_plot = serializers.CharField(source='get_plot_url', read_only=True)
    models = BMDAnalysisModelSerializer(many=True, read_only=True)
    run_executed = serializers.BooleanField(read_only=True)

    def to_representation(self, instance):
        ret = super(BMDAnalysisSerializer, self).to_representation(instance)
        ret['stats'] = instance.get_stats_for_table()
        return ret

    def validate_and_set_prior_weights(self, data, prior_weights):
        run = data.get('run', None) or self.instance.run
        ids = [d.get('id', -1) for d in prior_weights]
        wts = [d.get('prior_weight', 1.) for d in prior_weights]

        if not all([isinstance(d, int) for d in ids]):
            raise serializers.ValidationError("IDs must be integers")

        if not all([isinstance(d, (int, float)) for d in wts]):
            raise serializers.ValidationError("Weights must be floats")

        if run.models.count() != run.models.filter(id__in=ids).count():
            raise serializers.ValidationError("Invalid model IDs")

        # normalize weights
        wt_sum = float(sum(wts))
        nweights = [wt/wt_sum for wt in wts]

        # set weights
        weights = {}
        for i, id_ in enumerate(ids):
            weights[id_] = nweights[i]
        self.prior_weights = weights

    def get_current_or_updated(self, data, field):
        val = None
        if self.instance:
            val = getattr(self.instance, field)
        if field in data:
            val = data[field]
        return val

    def validate_subtypes(self, data):
        subtype = self.get_current_or_updated(data, 'subtype')
        bmr = self.get_current_or_updated(data, 'bmr')
        adversity_value = self.get_current_or_updated(data, 'adversity_value')
        if subtype in ['D', 'H'] and bmr is None:
            raise_field_validation_error(
                'bmr', 'This field may not be blank.')
        if subtype in ['C', 'H'] and adversity_value is None:
            raise_field_validation_error(
                'adversity_value', 'This field may not be blank.')

    def within_range(self, value, rng):
        return value >= rng[0] and value <= rng[1]

    def validate_bmrs(self, data):
        run = data.get('run', None) or self.instance.run
        bmr = self.get_current_or_updated(data, 'bmr')
        rngs = run.get_bmr_bounding_ranges()
        if not self.within_range(bmr, rngs['bmr_domain']):
            raise raise_field_validation_error(
                'bmr', 'Not within allowable range.')

    def validate_adversity_values(self, data):
        run = data.get('run', None) or self.instance.run
        value = self.get_current_or_updated(data, 'adversity_value')
        subtype = self.get_current_or_updated(data, 'subtype')
        act_type = self.get_current_or_updated(data, 'adversity_ct_type')
        ah_type = self.get_current_or_updated(data, 'adversity_hybrid_type')

        # exit-early if dichotomous
        if run.data_type in run.DICHOTOMOUS_TYPES:
            return

        rngs = run.get_bmr_bounding_ranges()
        if subtype == 'H':
            if ah_type == 'P':
                rng = rngs['quantile_domain']
            elif ah_type == 'A':
                rng = rngs['cutoff_domain']
            else:
                raise ValueError('Unknown adversity type')
        elif subtype == 'C':
            if act_type == 'R':
                rng = rngs['relative_change_domain']
            elif act_type == 'A':
                rng = rngs['absolute_change_domain']
            elif act_type == 'C':
                rng = rngs['cutoff_domain']
            else:
                raise ValueError('Unknown adversity type')
        else:
            raise ValueError('Unknown adversity type')

        if value and rng and not self.within_range(value, rng):
            raise raise_field_validation_error(
                'adversity_value', 'Not within allowable range.')

    def validate(self, data):
        """
        Validate prior weights are correct
        """
        prior_weights = self.context['request'].data.get('prior_weight', None)
        if not prior_weights and self.instance is None:
            raise serializers.ValidationError("Prior weights are required.")
        if prior_weights:
            self.validate_and_set_prior_weights(data, prior_weights)
        self.validate_subtypes(data)
        self.validate_adversity_values(data)
        self.validate_bmrs(data)
        return data

    class Meta:
        model = models.BMDAnalysis
        exclude = ('vectors', 'summary', )
