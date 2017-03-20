from django import forms
from django.core.urlresolvers import reverse
from django.contrib.auth.forms import AuthenticationForm, PasswordResetForm, SetPasswordForm

from crispy_forms import layout as cfl
from crispy_forms import bootstrap as cfb

from utils.forms import BaseFormHelper

from . import models


PASSWORD_HELP = "Must have at least 8 characters"


def check_password(pw):
    """
    Ensure password meets any complexity requirements.
    """
    if len(pw) < 8:
        raise forms.ValidationError(PASSWORD_HELP)


class RegistrationForm(forms.ModelForm):

    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput,
        help_text=PASSWORD_HELP)
    password2 = forms.CharField(
        label='Password confirmation',
        widget=forms.PasswordInput)

    class Meta:
        model = models.User
        fields = ("email", )

    def __init__(self, *args, **kwargs):
        super(RegistrationForm, self).__init__(*args, **kwargs)
        self.helper = self.setHelper()

    def setHelper(self):
        inputs = {
            "legend_text": u"Create an account"
        }

        helper = BaseFormHelper(self, **inputs)
        helper.form_class = "loginForm"

        helper.layout.append(
            cfb.FormActions(
                cfl.Submit('login', 'Create account'),
                cfl.HTML(
                    """<a role="button" class="btn btn-default" href="{}">Cancel</a>"""
                    .format(reverse('user:login'))),
            )
        )

        return helper

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if models.User.objects.filter(email__iexact=email).count() > 0:
            raise forms.ValidationError("User with this email already exists.")
        return email

    def clean(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            msg = "Passwords don't match"
            self.add_error('password2', msg)

    def clean_password1(self):
        pw = self.cleaned_data['password1']
        check_password(pw)
        return pw

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class LoginForm(AuthenticationForm):

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper = self.setHelper()

    def setHelper(self):

        inputs = {
            "legend_text": u"Login",
        }

        helper = BaseFormHelper(self, **inputs)

        helper.layout.append(
            cfb.FormActions(
                cfl.Submit('login', 'Login'),
                cfl.HTML(
                    """<a role="button" class="btn btn-default" href="{}">Cancel</a>"""
                    .format(reverse('home'))
                ),
                cfl.HTML("""<br><br>"""),
                cfl.HTML(
                    """<a href="{0}">Forgot your password?</a><br>"""
                    .format(reverse('user:password_reset'))
                ),
                cfl.HTML(
                    """<a href="{0}">Create an account</a><br>"""
                    .format(reverse('user:register'))
                )
            )
        )

        return helper


class ResetPasswordEmailForm(PasswordResetForm):

    def __init__(self, *args, **kwargs):
        super(ResetPasswordEmailForm, self).__init__(*args, **kwargs)
        self.helper = self.setHelper()

    def setHelper(self):

        inputs = {
            "legend_text": u"Password reset",
            "help_text": u"""
                Forgotten your password, or creating a new
                account? Enter your email address below, and we'll email
                instructions for setting a new password.
            """
        }

        helper = BaseFormHelper(self, **inputs)

        helper.layout.append(
            cfb.FormActions(
                cfl.Submit('submit', 'Send password reset email'),
                cfl.HTML(
                    """<a role="button" class="btn btn-default" href="{}">Cancel</a>"""
                    .format(reverse('user:login'))
                ),
            )
        )

        return helper


class ResetPasswordForm(SetPasswordForm):

    def __init__(self, *args, **kwargs):
        super(ResetPasswordForm, self).__init__(*args, **kwargs)
        self.fields['new_password1'].help_text = PASSWORD_HELP
        self.helper = self.setHelper()

    def clean_new_password1(self):
        pw = self.cleaned_data['new_password1']
        check_password(pw)
        return pw

    def setHelper(self):
        inputs = {
            "legend_text": u"Update your password",
            "help_text": u"""
                Please enter your new password twice so we can verify you
                typed it in correctly.
            """
        }

        helper = BaseFormHelper(self, **inputs)
        helper.form_class = "loginForm"

        helper.layout.append(
            cfb.FormActions(
                cfl.Submit('submit', 'Change my password'),
            )
        )

        return helper
