import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import api from '../../api/artifacts-api'

import Loader from '../../common/Loader/Loader'
import ArtifactsPreviewView from './ArtifactsPreviewView'

const ArtifactsPreview = ({ artifact }) => {
  const [isLoader, setLoader] = useState(false)
  const [preview, setPreview] = useState({
    type: null,
    data: null
  })

  useEffect(() => {
    setLoader(true)
    getArtifactPreview(
      artifact.target_path.schema,
      artifact.target_path.path
    ).then(() => setLoader(false))
  }, [artifact.target_path])

  const getArtifactPreview = (schema, path) => {
    return api.getArtifactPreview(schema, path).then(res => {
      const artifact = {}
      if (res.headers['content-type'].includes('text/csv')) {
        const data = res.data.split('\n')
        if (data[0].includes('state')) {
          const headers = data[0].split(',')
          let content = data.slice(1)
          content.pop()
          content = content.map(item => item.split(','))
          artifact.type = 'table-results'
          artifact.iterationStats = [headers].concat(content)
        } else {
          let content = data.slice(1)
          content = content.map(item => item.split(','))
          content.pop()
          artifact.type = 'table'
          artifact.data = {
            headers: data[0].split(','),
            content: content
          }
        }
      } else if (res.headers['content-type'].includes('text/plain')) {
        artifact.type = 'text'
        artifact.data = {
          content: res.data
        }
      } else if (res.headers['content-type'].includes('text/html')) {
        artifact.type = 'html'
        artifact.data = {
          content: res.data
        }
      } else if (res.headers['content-type'].includes('application/json')) {
        artifact.type = 'json'
        artifact.data = {
          content: res.data
        }
      } else if (res.headers['content-type'].includes('image')) {
        artifact.type = 'image'
        artifact.data = {
          content: URL.createObjectURL(new Blob([res.data]))
        }
      } else {
        artifact.type = 'unknown'
      }
      setPreview(artifact)
    })
  }

  return isLoader ? <Loader /> : <ArtifactsPreviewView preview={preview} />
}

ArtifactsPreview.propTypes = {
  artifact: PropTypes.shape({}).isRequired
}

export default ArtifactsPreview