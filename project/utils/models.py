import os

import cPickle as pkl


from django.db.models.fields.files import FileField, FieldFile


class PickledFieldFile(FieldFile):

    def _get_filename(self, id):
        """Filename combines unique id and model name"""
        return '{}-{}.pkl'.format(id, self.field.model.__name__)

    @property
    def data(self):
        """Returns pickled data stored in the file"""
        if not hasattr(self, '_data'):
            self._data = pkl.load(self.file)
            self.file.close()
        return self._data

    def create_pickle_file(self, id_, content):
        """
        Save content to a file and set the filename of the field to the
        created pickle file. Note that an id_ is required; therefore
        a pickled_file can only be created on an update.
        """
        fn = self._get_filename(id_)
        # overwrites without checking
        with open(os.path.join(self.storage.location, fn), 'wb') as f:
            pkl.dump(content, f, protocol=pkl.HIGHEST_PROTOCOL)
        self.name = fn


class PickledFileField(FileField):
    """
    File field which stores data in a pickled file.
    """
    attr_class = PickledFieldFile
